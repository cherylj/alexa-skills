/* Copyright 2017 Cheryl Jennings */
/* eslint-disable no-console */

var Alexa = require('alexa-sdk');
const p = require('../lib/_prompts');
const c = require('../lib/_constants');

module.exports = Alexa.CreateStateHandler(c.states.USERGUESSMODE, {
    'MAKEAGUESS': function() {
        var guess = parseInt(this.event.request.intent.slots.Guess.value);
        if(Number.isNaN(guess)) {
            this.emitWithState('Unhandled');
            return;
        }
        if (guess < this.attributes['myNumber']) {
            this.attributes['lastPrompt'] = ['Your guess of ' + guess + ' was too low.  Please guess again'];
            this.emit(':ask', 'Too low, guess again!', this.attributes['lastPrompt'][0]);
        } else if (guess > this.attributes['myNumber']) {
            this.attributes['lastPrompt'] = ['Your guess of ' + guess + ' was too high.  Please guess again'];
            this.emit(':ask', 'Too high, guess again!', this.attributes['lastPrompt'][0]);
        } else {
            this.attributes['myNumber'] = undefined;
            this.attributes['lastPrompt'] = ['Should I think of another number for you to guess?'];
            this.attributes['startGameAsGuesser'] = 'pending';
            this.handler.state = c.states.NEWGAMEMODE;
            this.emitWithState(':ask', 'That\'s right!  My number was ' + guess + '<break strength="strong"/> Would you like to play again?',
                this.attributes['lastPrompt'][0]);
        }
    },
    'STARTGAMEASGUESSER': function() {
        this.attributes['startGameAsGuesser'] = 'pending';
        this.attributes['giveRange'] = undefined;
        if (Array.isArray(this.attributes['lastPrompt'])) {
            this.attributes['lastPrompt'].unshift(p.prompts.confirmStartOver);
        } else {
            this.attributes['lastPrompt'] = [p.prompts.confirmStartOver];
        }
        this.emit(':ask', p.prompts.confirmStartOver);
    },
    'GIVEARANGE': function() {
        this.attributes['startGameAsGuesser'] = undefined;

        var first = parseInt(this.event.request.intent.slots.First.value);
        var second = parseInt(this.event.request.intent.slots.Second.value);

        if (Number.isNaN(first) || Number.isNaN(second)) {
            this.emitWithState('Unhandled');
        }

        // The high and low will be validated in newGameHandlers
        this.attributes['newHigh'] = second;
        this.attributes['newLow'] = first;
        this.attributes['giveRange'] = 'pending';

        if (Array.isArray(this.attributes['lastPrompt'])) {
            this.attributes['lastPrompt'].unshift(p.prompts.confirmStartOver);
        } else {
            this.attributes['lastPrompt'] = [p.prompts.confirmStartOver];
        }
        this.emit(':ask', p.prompts.confirmStartOver);
    },
    'AMAZON.HelpIntent': function() {
        // output info about current state of game
        // or tell users they can 'start again'
    },
    'YESINTENT': function() {
        if (this.attributes['startGameAsGuesser']) {
            this.attributes['startGameAsGuesser'] = undefined;
            this.attributes['myNumber'] = undefined;
            this.attributes['lastPrompt'] = undefined;
            this.handler.state = c.states.NEWGAMEMODE;
            this.emitWithState('STARTGAMEASGUESSER');
            return;
        }

        if (this.attributes['giveRange']) {
            this.attributes['giveRange'] = undefined;
            this.attributes['myNumber'] = undefined;
            this.attributes['lastPrompt'] = undefined;
            this.handler.state = c.states.NEWGAMEMODE;
            this.emitWithState('GIVEARANGE');
            return;
        }
        this.emitWithState('Unhandled');
    },
    'NOINTENT': function() {
        this.attributes['startGameAsGuesser'] = undefined;
        this.attributes['giveRange'] = undefined;
        this.attributes['newHigh'] = undefined;
        this.attributes['newLow'] = undefined;

        if (Array.isArray(this.attributes['lastPrompt'])) {
            if (this.attributes['lastPrompt'].length > 1) {
                this.attributes['lastPrompt'].shift();
            }
            this.emit(':ask', 'Ok, ' + this.attributes['lastPrompt'][0]);
        } else {
            this.emit(':ask', 'Try saying a number.');
        }
    },
    'Unhandled': function() {
        if (Array.isArray(this.attributes['lastPrompt']) && (this.attributes['lastPrompt'].length >= 1)) {
            this.emit(':ask', 'Sorry, I didn\'t get that.  ' + this.attributes['lastPrompt'][0]);
        } else {
            this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
        }
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', p.getRandomGoodbye());
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', p.getRandomGoodbye());
    }
});
