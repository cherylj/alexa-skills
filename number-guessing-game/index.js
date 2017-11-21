/* Copyright 2017 Cheryl Jennings */
'use strict';

var Alexa = require('alexa-sdk');
const guessModeHandlers = require('./_userGuessModeHandlers');

var states = {
    USERGUESSMODE: '_USERGUESSMODE', // User is trying to guess the number.
    MYGUESSMODE: '_MYGUESSMODE', // I am trying to guess the number.
};

var newSessionHandlers = {
    'NewSession': function() {
        this.emit(':ask', 'Start a new game by asking me to think of a number, or say I\'m thinking of a number between 1 and 100');
    },
    'AMAZON.HelpIntent': function() {

    },
    'STARTGAMEASGUESSER': function() {
        this.handler.state = states.USERGUESSMODE;
        this.attributes['myNumber'] = Math.floor(Math.random() * 100);
        this.emit(':ask', 'Ok, I\'m thinking of a number between 1 and 100.  Can you guess what it is?');
    },
    'GIVEARANGE': function() {
        var first = parseInt(this.event.request.intent.slots.First.value);
        var second = parseInt(this.event.request.intent.slots.Second.value);
        this.handler.state = states.MYGUESSMODE;
        if (first === second) {
            this.emit('It\'s ' + first + '!');
            return;
        }
        if (first < second) {
            this.attributes['low'] = first;
            this.attributes['high'] = second;
        } else {
            this.attributes['low'] = second;
            this.attributes['high'] = first;
        }
        this.attributes['myGuess'] = first +
            Math.floor((this.attributes['high'] - this.attributes['low']) / 2);
        this.emit('my guess is ' + this.attributes['myGuess']);
    }
};

exports.handler = function(event, context){
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, guessModeHandlers);
    alexa.execute();
};
