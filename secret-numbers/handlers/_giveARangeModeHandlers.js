/* Copyright 2017 Cheryl Jennings */
/* eslint-disable no-console */

/* This file contains the handlers for the MYGUESSMODE state.  This state means
 * that the user has given us a range, which is stored in this.attributes['low']
 * and this.attributes['high'].  The values in these attributes are exclusive,
 * meaning those numbers cannot be guessed.  (We assume that the range given
 * to use by the user is inclusive)
 *
 * We make a guess and adjust the high / low values based on the user's response.
 */

var Alexa = require('alexa-sdk');
const p = require('../lib/_prompts');
const c = require('../lib/_constants');
const m = require('../lib/_maths');

const getNoSensePrompt = (attributes) => {
    let prompt = 'I got confused.';
    if (attributes['lastAnswer'] === 'high') {
        if (attributes['myGuess'] === attributes['rangeLow']) {
            prompt = `${attributes['myGuess']} can't be too high based on the range you gave earlier of ` +
                `${attributes['rangeLow']} and ${attributes['rangeHigh']}!`;
        } else if (attributes['myGuess'] === (attributes['low'] + 1)) {
            prompt = `${attributes['myGuess']} can't be too high because you previously said ` +
                `${attributes['low']} was too low!`;
        }
    } else if (attributes['lastAnswer'] === 'low') {
        if (attributes['myGuess'] === attributes['rangeHigh']) {
            prompt = `${attributes['myGuess']} can't be too low based on the range you gave earlier of ` +
                `${attributes['rangeLow']} and ${attributes['rangeHigh']}!`;
        } else if (attributes['myGuess'] === (attributes['high'] - 1)) {
            prompt = `${attributes['myGuess']} can't be too low because you previously said ` +
                `${attributes['high']} was too high!!`;
        }
    }

    return `${p.getRandomOops()}  ${prompt}  Let's start over.  `;
};

const clearGuessingState = (attributes) => {
    attributes['myGuess'] = undefined;
    attributes['high'] = undefined;
    attributes['low'] = undefined;
    attributes['rangeLow'] = undefined;
    attributes['rangeHigh'] = undefined;
    attributes['lastPrompt'] = undefined;
    attributes['lastAnswer'] = undefined;
};

module.exports = Alexa.CreateStateHandler(c.states.MYGUESSMODE, {
    'NOSENSE': function() {
        /* This is not an intent that is exposed to the user.  It is only used
         * internally when given the current range, it must be a certain number,
         * but the user has not indicated that our guess is correct.  We cry foul
         * and prompt to start a new game (by switching to the initial undefined state)
         */

        const prompt = getNoSensePrompt(this.attributes);

        /* unset all of our state */
        clearGuessingState(this.attributes);

        this.handler.state = c.states.NEWGAMEMODE;
        this.emit(':ask', prompt + p.prompts.helpText);
    },
    'TOOHIGH': function() {
        this.attributes['high'] = this.attributes['myGuess'];
        const guess = m.nextGuess(this.attributes['high'], this.attributes['low']);
        if (Number.isNaN(guess)) {
            /* Too high makes no sense! */
            this.attributes['lastAnswer'] = 'high';
            this.emitWithState('NOSENSE');
        }
        this.attributes['myGuess'] = guess;
        this.attributes['lastPrompt'] = ['Is ' + this.attributes['myGuess'] + ' too high or too low?'];
        this.emit(':ask', 'Is it ' + this.attributes['myGuess'] + '?', this.attributes['lastPrompt']);
    },
    'TOOLOW': function() {
        this.attributes['low'] = this.attributes['myGuess'];
        const guess = m.nextGuess(this.attributes['high'], this.attributes['low']);
        if (Number.isNaN(guess)) {
            /* Too low makes no sense! */
            this.attributes['lastAnswer'] = 'low';
            this.emitWithState('NOSENSE');
        }

        this.attributes['myGuess'] = guess;
        this.attributes['lastPrompt'] = ['Is ' + this.attributes['myGuess'] + ' too high or too low?'];
        this.emit(':ask', 'Is it ' + this.attributes['myGuess'] + '?', this.attributes['lastPrompt']);
    },
    'STARTGAMEASGUESSER': function() {
        this.attributes['startGameAsGuesser'] = 'pending';
        this.attributes['giveRange'] = undefined;

        if (this.attributes['myGuess']) {
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
        this.attributes['giveRange'] = 'pending';

        /* If we were in the middle of a game, push the confirmation prompt onto
         * the stack so it can get popped off and the previous prompt restated if
         * the user says no.
         */
        if (this.attributes['myGuess']) {
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
            clearGuessingState(this.attributes);
            this.handler.state = c.states.NEWGAMEMODE;
            this.emitWithState('STARTGAMEASGUESSER');
            return;
        }

        if (this.attributes['giveRange']) {
            this.attributes['giveRange'] = undefined;
            clearGuessingState(this.attributes);
            this.handler.state = c.states.NEWGAMEMODE;
            this.emitWithState('GIVEARANGE');
            return;
        }

        if (this.attributes['myGuess']) {
            this.emitWithState('CORRECTANSWER');
            return;
        }
        this.emitWithState('Unhandled');
    },
    'CORRECTANSWER': function() {
        clearGuessingState(this.attributes);
        this.attributes['lastPrompt'] = ['Think of another number and give me the range to play again.'];
        this.emit(':ask', `${p.getRandomYay()}  Give me another range if you'd like to play again!`,
            this.attributes['lastPrompt'][0]);
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
            return;
        } else {
            /* They're not saying no in response to a question we asked. */
            this.emitWithState('AMAZON.HelpIntent');
        }

        this.emit(':ask', 'Ok, ' + this.attributes['lastPrompt'][0]);
    },
    'Unhandled': function() {
        if (Array.isArray(this.attributes['lastPrompt'])) {
            this.emit(':ask', 'Sorry, I didn\'t get that.  ' + this.attributes['lastPrompt'][0]);
        } else {
            this.emit(':ask', 'Sorry, I didn\'t get that.  ' + p.prompts.helpText);
        }
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', p.getRandomGoodbye());
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', p.getRandomGoodbye());
    }
});
