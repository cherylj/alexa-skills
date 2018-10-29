/* Copyright 2017 Cheryl Jennings */
'use strict';

const Alexa = require('ask-sdk-v1adapter');
const keys = require('./keys');
const u = require('./lib/_util');
const addHandlers = require('./handlers/_addHandlers');
const helpHandlers = require('./handlers/_helpHandlers');
const manageGameHandlers = require('./handlers/_manageGameHandlers');
const playGameHandlers = require('./handlers/_playGameHandlers');

var newSessionHandlers = {
    'blank': function() {
        const utterance = this.event.request.intent.slots.fact.value;
        const intent = u.getIntent(utterance);
        if (intent === u.intents.UNDEFINED) {
            this.handler.state = u.states.HELP_ME;
            this.emitWithState(intent);
        }

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
        this.handler.state = u.states.HELP_ME;
        this.emitWithState(u.intents.HELP);
    }
};

exports.handler = function(event, context){
    var alexa = Alexa.handler(event, context);
    alexa.appId = keys.skillId;
    alexa.registerHandlers(newSessionHandlers,
        addHandlers.addName, addHandlers.promptName, addHandlers.confirmName,
        addHandlers.addFact, addHandlers.promptFact, addHandlers.confirmFact,
        manageGameHandlers.startGame, manageGameHandlers.confirmDelete,
        playGameHandlers.playNext, helpHandlers.helpHandler);
    alexa.execute();
};
