/* Copyright 2017 Cheryl Jennings */
/* eslint-disable no-console */

var Alexa = require('alexa-sdk');
const p = require('../lib/_prompts');
const c = require('../lib/_constants');
const m = require('../lib/_maths');

module.exports = Alexa.CreateStateHandler(c.states.NEWGAMEMODE, {
    'STARTGAMEASGUESSER': function() {
        this.handler.state = c.states.USERGUESSMODE;
        this.attributes['myNumber'] = Math.floor(Math.random() * 100) + 1;
        this.attributes['lastPrompt'] = ['I\'m thinking of a number between 1 and 100.  Can you guess what it is?'];
        this.emit(':ask', this.attributes['lastPrompt'][0]);
    },
    'GIVEARANGE': function() {
        let first;
        let second;
        if (this.attributes['newHigh'] && this.attributes['newLow']) {
            first = this.attributes['newLow'];
            second = this.attributes['newHigh'];
            this.attributes['newHigh'] = undefined;
            this.attributes['newLow'] = undefined;
        } else {
            try {
                first = parseInt(this.event.request.intent.slots.First.value);
                second = parseInt(this.event.request.intent.slots.Second.value);
            } catch (e) {
                this.emitWithState('Unhandled');
                return;
            }
        }

        if (Number.isNaN(first) || Number.isNaN(second)) {
            this.emitWithState('Unhandled');
            return;
        }

        if (first === second) {
            this.emit(':ask', 'It\'s ' + first + '!, Give me another range if you\'d like to play again!');
            return;
        }

        this.handler.state = c.states.MYGUESSMODE;
        if (first < second) {
            this.attributes['rangeLow'] = first;
            this.attributes['rangeHigh'] = second;
        } else {
            this.attributes['rangeLow'] = second;
            this.attributes['rangeHigh'] = first;
        }
        // The range given is assumed to be inclusive.  Adjust high / low and save spoken values for prompts
        this.attributes['low'] = this.attributes['rangeLow'] - 1;
        this.attributes['high'] = this.attributes['rangeHigh'] + 1;

        this.attributes['myGuess'] = (m.nextGuess(this.attributes['high'], this.attributes['low']));
        this.attributes['lastPrompt'] = ['Is ' + this.attributes['myGuess'] + ' too high or too low?'];
        this.emit(':ask', 'Okay, a number between ' + this.attributes['rangeLow'] + ' and ' + this.attributes['rangeHigh'] + '.  My guess is ' + this.attributes['myGuess'],
            this.attributes['lastPrompt'][0]);
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', p.prompts.helpText);
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
