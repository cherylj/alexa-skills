/* Copyright 2017 Cheryl Jennings */
'use strict';

const Alexa = require('alexa-sdk');
const keys = require('./keys');
const u = require('./lib/_util');
const addHandlers = require('./handlers/_addHandlers');
const manageGameHandlers = require('./handlers/_manageGameHandlers');

var newSessionHandlers = {
    'blank': function() {
        const utterance = this.event.request.intent.slots.fact.value;
        const intent = u.getIntent(utterance);
        this.handler.state = u.getStateForIntent(intent);
        this.emitWithState(intent);
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', 'goodbye!');
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', 'goodbye!');
    },
    'Unhandled': function() {
        this.emit(':tell', 'Sorry, I didn\'t catch that.');
    }
};

exports.handler = function(event, context){
    var alexa = Alexa.handler(event, context);
    alexa.appId = keys.skillId;
    alexa.registerHandlers(newSessionHandlers,
        addHandlers.addName, addHandlers.promptName, addHandlers.confirmName,
        addHandlers.addFact, addHandlers.promptFact, addHandlers.confirmFact,
        manageGameHandlers.startGame);
    alexa.execute();
};
