/* Copyright 2018 Cheryl Jennings */
/* eslint-disable no-console */

const Alexa = require('ask-sdk-v1adapter');
const u = require('../lib/_util');
const s3 = require('../lib/_s3');

const startGame = Alexa.CreateStateHandler(u.states.START_GAME, {
    'startNew': function() {
        const createCallback = (err) => {
            if (err) {
                this.emit(':tell', 'Sorry, something went wrong trying to create your game.  Try again in a few minutes');
                return;
            }
            this.emit(':tell', 'Game created!  You can add a fact by asking me to add fact');
        };

        const checkExistsCallback = (obj, err) => {
            if (err != null) {
                this.emit(':tell', 'Sorry, something went wrong trying to create your game.  Try again in a few minutes');
                return;
            }

            if (obj == null){
                return s3.createNewGame(this.event.context.System.user.userId, false, createCallback.bind(this));
            }

            const count = obj.entries.length;
            if (count === 0) {
                return s3.createNewGame(this.event.context.System.user.userId, true, createCallback.bind(this));
            }
            this.handler.state = u.states.CONFIRM_DELETE;
            this.attributes['createNew'] = true;
            this.emit(':ask', `You currently have a game with ${count} entries.  Do you want to delete it and start a new game?`);
        };
        return s3.getGameInfo(this.event.context.System.user.userId, false, checkExistsCallback.bind(this));
    },
    'delete': function() {
        const checkExistsCallback = (obj, err) => {
            if (err != null) {
                this.emit(':tell', 'There was a problem accessing your account.  Please try again in a few minutes.');
                return;
            }

            if (obj == null) {
                this.emit(':tell', 'You do not have an active game.');
                return;
            }

            this.handler.state = u.states.CONFIRM_DELETE;
            const count = obj.entries.length;
            if (count === 0) {
                this.emitWithState('AMAZON.YesIntent');
                return;
            }

            this.attributes['createNew'] = false;
            this.emit(':ask', `You currently have a game with ${count} entries.  Are you sure you want to delete it?`);
        };

        return s3.getGameInfo(this.event.context.System.user.userId, false, checkExistsCallback.bind(this));
    }
});

const confirmDelete = Alexa.CreateStateHandler(u.states.CONFIRM_DELETE, {
    'blank': function() {
        const utterance = this.event.request.intent.slots.fact.value;
        this.emitWithState(u.getIntent(utterance));
    },
    'AMAZON.NoIntent': function() {
        this.emit(':tell', 'Okay, keeping your current game.');
    },
    'AMAZON.YesIntent': function() {
        const deleteCallback = (err) => {
            if (err) {
                this.emit(':tell', 'Sorry, something went wrong when trying to delete your game.  Try again in a few minutes');
                return;
            }
            this.emit(':tell', 'Game deleted.');
        };

        s3.deleteGame(this.event.context.System.user.userId, deleteCallback.bind(this));
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'If you would like to delete your current game, say yes.  Otherwise, say no.');
    },
    'Unhandled': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that.  Do you want to delete your current game?');
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', 'Okay, keeping your current game for now.');
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', 'Okay, keeping your current game for now.');
    }
});

module.exports = { startGame, confirmDelete };
