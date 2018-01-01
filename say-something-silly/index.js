/* Copyright 2017 Cheryl Jennings */
'use strict';

const Alexa = require('alexa-sdk');
const speech = require('./lib/_speech');
const keys = require('./keys');

const newSessionHandlers = {
    'Unhandled': function() {
        this.emitWithState('SAYIT');
    },
    'SAYIT': function() {
        const emit = (text) => {
            this.emit(':tell', text);
        };
        speech.getSillyText(emit.bind(this));
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':tell', 'Tell me to say something silly');
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', speech.getRandomGoodbye());
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', speech.getRandomGoodbye());
    }
};

exports.handler = function(event, context){
    const alexa = Alexa.handler(event, context);
    alexa.appId = keys.skillId;
    alexa.registerHandlers(newSessionHandlers);
    alexa.execute();
};
