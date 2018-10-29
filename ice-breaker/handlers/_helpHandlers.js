/* Copyright 2018 Cheryl Jennings */
'use strict';

const Alexa = require('ask-sdk-v1adapter');
const u = require('../lib/_util');
const s3 = require('../lib/_s3');

const fullHelpText = 'Friendly facts helps you get to know each other by guessing who said what!  You can start a new game by saying start new, then add a new fact by saying add fact.  Once everyone has shared their secret, say play game to hear the fact and see if you can guess who said it before time runs out!';

const getHasGameHelp = (count) => {
    return `You currently have a game with ${count} entries.  You can add a new fact, play the game, or start a new game.  Say full help for more information.`;
};

const getFullHelp = () => {
    return fullHelpText;
};

const getEmptyGameHelp = () => {
    return 'Welcome to Friendly facts!  You can start a new game or say full help to get more info.';
};

const helpHandler = Alexa.CreateStateHandler(u.states.HELP_ME, {
    'blank': function() {
        const utterance = this.event.request.intent.slots.fact.value;
        const intent = u.getIntent(utterance);
        if (intent === u.intents.HELP) {
            this.emitWithState(u.intents.HELP);
        }

        if (intent === u.intents.FULL_HELP) {
            this.emitWithState(u.intents.FULL_HELP);
        }

        this.handler.state = u.getStateForIntent(intent);
        this.emitWithState(intent);
    },
    'fullHelp': function() {
        this.emit(':ask', getFullHelp());
    },
    'AMAZON.HelpIntent': function() {
        const getGameInfoCallback = (obj) => {
            if (obj == null || obj.entries.length == 0) {
                this.emit(':ask', getEmptyGameHelp());
                return;
            }
            this.emit(':ask', getHasGameHelp(obj.entries.length));
        };

        return s3.getGameInfo(this.event.context.System.user.userId, false, getGameInfoCallback.bind(this));
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', 'goodbye!');
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', 'goodbye!');
    },
    'Unhandled': function() {
        this.emitWithState(u.intents.HELP);
    }
});

module.exports = { helpHandler };
