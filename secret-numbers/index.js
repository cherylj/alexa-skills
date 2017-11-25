/* Copyright 2017 Cheryl Jennings */
'use strict';

var Alexa = require('alexa-sdk');
const guessModeHandlers = require('./handlers/_userGuessModeHandlers');
const giveARangeModeHandlers = require('./handlers/_giveARangeModeHandlers');
const newGameHandlers = require('./handlers/_newGameHandlers');
const p = require('./lib/_prompts');
const c = require('./lib/_constants');

var newSessionHandlers = {
    'Unhandled': function() {
        if (this.event.session.new) {
            this.emit(':ask', p.getRandomGreeting() + ' <break strength="strong"/> ' + p.prompts.helpText);
        }
        this.emit(':ask', p.prompts.helpText);
    },
    'AMAZON.HelpIntent': function() {
        if (this.event.session.new) {
            this.emit(':ask', p.getRandomGreeting() + ' <break strength="strong"/> ' + p.prompts.helpText);
        }
        this.emit(':ask', p.prompts.helpText);
    },
    'STARTGAMEASGUESSER': function() {
        this.handler.state = c.states.NEWGAMEMODE;
        this.emitWithState('STARTGAMEASGUESSER');
    },
    'GIVEARANGE': function() {
        this.handler.state = c.states.NEWGAMEMODE;
        this.emitWithState('GIVEARANGE');
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', p.getRandomGoodbye());
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', p.getRandomGoodbye());
    }
};

exports.handler = function(event, context){
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.f72a7250-b9c2-445d-aef4-2c5a5e6e0cdd';
    alexa.registerHandlers(newSessionHandlers, guessModeHandlers, newGameHandlers, giveARangeModeHandlers);
    alexa.execute();
};
