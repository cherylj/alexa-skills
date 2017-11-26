/* Copyright 2017 Cheryl Jennings */
/* eslint-disable no-console */

/* This file contains the handlers for the USERGUESSMODE state.  This state means
 * that the user is guessing our random number.  We'll keep telling them that they're
 * too high or too low until they guess our number.
 */

var Alexa = require('alexa-sdk');
const p = require('../lib/_prompts');
const c = require('../lib/_constants');

module.exports = Alexa.CreateStateHandler(c.states.USERGUESSMODE, {
    'MAKEAGUESS': function() {
        if (typeof this.attributes['myNumber'] === 'undefined') {
            this.emit(':ask', 'We\'re not in a game!  ' + p.prompts.helpText);
        }
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
            /* We know that guess is a number and it was equal to our number.  Prompt
             * user to start a new game
             */
            this.attributes['myNumber'] = undefined;
            this.attributes['lastPrompt'] = ['Tell me to think of a number if you\'d like to play again!'];
            this.emit(':ask', `That's right!  My number was ${guess}!  ${p.getRandomGoodJob()}  ${this.attributes['lastPrompt'][0]}`,
                this.attributes['lastPrompt'][0]);
        }
    },
    'STARTGAMEASGUESSER': function() {
        this.attributes['giveRange'] = undefined;

        if (this.attributes['myNumber']) {
            /* We are currently in a game, prompt for confirmation, but save off
             * the last prompt
             */
            this.attributes['startGameAsGuesser'] = 'pending';
            if (Array.isArray(this.attributes['lastPrompt'])) {
                this.attributes['lastPrompt'].unshift(p.prompts.confirmStartOver);
            } else {
                this.attributes['lastPrompt'] = [p.prompts.confirmStartOver];
            }
            this.emit(':ask', p.prompts.confirmStartOver);
            return;
        }

        this.handler.state = c.states.NEWGAMEMODE;
        this.emitWithState('STARTGAMEASGUESSER');
    },
    'GIVEARANGE': function() {
        this.attributes['startGameAsGuesser'] = undefined;
        var first = parseInt(this.event.request.intent.slots.First.value);
        var second = parseInt(this.event.request.intent.slots.Second.value);

        if (Number.isNaN(first) || Number.isNaN(second)) {
            /* Don't prompt for confirmation since this request wasn't valid */
            this.emitWithState('Unhandled');
            return;
        }

        /* The high and low will be validated in newGameHandlers.  We have to
         * save off these values as they won't be present after we get confirmation
         * to start a new game.
         */
        this.attributes['newHigh'] = second;
        this.attributes['newLow'] = first;

        /* If we were in the middle of a game, push the confirmation prompt onto
         * the stack so it can get popped off and the previous prompt restated if
         * the user says no.
         */
        if (this.attributes['myNumber']) {
            this.attributes['giveRange'] = 'pending';
            if (Array.isArray(this.attributes['lastPrompt'])) {
                this.attributes['lastPrompt'].unshift(p.prompts.confirmStartOver);
            } else {
                this.attributes['lastPrompt'] = [p.prompts.confirmStartOver];
            }
            this.emit(':ask', p.prompts.confirmStartOver);
            return;
        }

        this.handler.state = c.states.NEWGAMEMODE;
        this.emitWithState('GIVEARANGE');
    },
    'AMAZON.HelpIntent': function() {
        if (Array.isArray(this.attributes['lastPrompt'])) {
            this.emit(':ask', p.prompts.helpText, this.attributes['lastPrompt'][0]);
            return;
        }
        this.emit(':ask', p.prompts.helpText);
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

        if (Array.isArray(this.attributes['lastPrompt']) && (this.attributes['lastPrompt'].length >= 1)) {
            if (this.attributes['lastPrompt'].length > 1) {
                this.attributes['lastPrompt'].shift();
            }
            this.emit(':ask', 'Ok, ' + this.attributes['lastPrompt'][0]);
        } else {
            /* They're not saying no in response to a question we asked. */
            this.emit(':ask', p.prompts.helpText);
        }
    },
    'Unhandled': function() {
        if (Array.isArray(this.attributes['lastPrompt']) && (this.attributes['lastPrompt'].length >= 1)) {
            this.emit(':ask', 'Sorry, I didn\'t get that.  ' + this.attributes['lastPrompt'][0]);
            return;
        }
        this.emit(':ask', 'Sorry, I didn\'t get that. '  + p.prompts.helpText);
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', p.getRandomGoodbye());
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', p.getRandomGoodbye());
    }
});
