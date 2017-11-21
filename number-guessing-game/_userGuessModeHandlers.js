/* Copyright 2017 Cheryl Jennings */
/* eslint-disable no-console */

var Alexa = require('alexa-sdk');
const prompts = require('./_prompts');

var states = {
    USERGUESSMODE: '_USERGUESSMODE', // User is trying to guess the number.
    MYGUESSMODE: '_MYGUESSMODE', // I am trying to guess the number.
};

module.exports = Alexa.CreateStateHandler(states.USERGUESSMODE, {
    'NEWSESSION': function () {
        this.handler.state = '';
        this.emitWithState('NEWSESSION'); // Equivalent to the Start Mode NewSession handler
    },
    'MAKEAGUESS': function() {
        var guess = parseInt(this.event.request.intent.slots.Guess.value);
        if(Number.isNaN(guess)) {
            if (this.attributes['lastPrompt']) {
                this.emit(':ask', 'Sorry, I didn\'t get that.  ' + this.attributes['lastPrompt']);
            } else {
                this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
            }
            return;
        }
        if (guess < this.attributes['myNumber']) {
            this.attributes['lastPrompt'] = 'Your guess of ' + guess + ' was too low.  Please guess again';
            this.emit(':ask', 'Too low, guess again!', 'Your guess of ' + guess + ' was too low.  Please guess again');
        } else if (guess > this.attributes['myNumber']) {
            this.attributes['lastPrompt'] = 'Your guess of ' + guess + ' was too high.  Please guess again';
            this.emit(':ask', 'Too high, guess again!', 'Your guess of ' + guess + ' was too high.  Please guess again');
        } else {
            this.handler.state = '';
            this.attributes['myNumber'] = undefined;
            this.attributes['lastPrompt'] = undefined;
            this.emit(':ask', 'That\'s right!  My number was ' + guess);
        }
    },
    'STARTGAMEASGUESSER': function() {
        this.attributes['startGameAsGuesser'] = 'pending';
        this.attributes['giveRange'] = undefined;
        this.emit(':ask', prompts.confirmStartOver);
    },
    'GIVEARANGE': function() {
        this.attributes['startGameAsGuesser'] = undefined;
        this.attributes['giveRange'] = 'pending';
        this.emit(':ask', prompts.confirmStartOver);
    },
    'AMAZON.HelpIntent': function() {
        // output info about current state of game
        // or tell users they can 'start again'
    },
    'YESINTENT': function() {
        if (this.attributes['startGameAsGuesser']) {
            this.attributes['startGameAsGuesser'] = undefined;
            this.attributes['myNumber'] = Math.floor(Math.random() * 100);
            this.emit(':ask', 'Ok, I\'m thinking of a number between 1 and 100.  Can you guess what it is?');
            return;
        }

        if (this.attributes['giveRange']) {
            this.attributes['giveRange'] = undefined;
            this.attributes['myNumber'] = undefined;
            this.handler.state = '';
            this.emit(':ask', 'Ok, give me a range');
            return;
        }

        if (this.attributes['lastPrompt']) {
            this.emit(':ask', 'Sorry, I didn\'t get that.  ' + this.attributes['lastPrompt']);
        } else {
            this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
        }
    },
    'AMAZON.NoIntent': function() {
        this.attributes['startGameAsGuesser'] = undefined;
        this.attributes['giveRange'] = undefined;

        if (this.attributes['lastPrompt']) {
            this.emit(':ask', this.attributes['lastPrompt']);
        } else {
            this.emit(':ask', 'Try saying a number.');
        }
    },
    'Unhandled': function() {
        if (this.attributes['lastPrompt']) {
            this.emit(':ask', 'In unhandled.  Sorry, I didn\'t get that.  ' + this.attributes['lastPrompt']);
        } else {
            this.emit(':ask', 'In unhandled.  Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
        }
    }
});
