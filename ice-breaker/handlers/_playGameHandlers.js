/* Copyright 2018 Cheryl Jennings */
/* eslint-disable no-console */

const Alexa = require('ask-sdk-v1adapter');
const u = require('../lib/_util');
const s3 = require('../lib/_s3');

const _getLastPrompt = () => {
    const prompts = [
        'Here\'s the last entry!',
        'Okay, here\'s your last fact!',
        'Last one!'
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
};

const playNext = Alexa.CreateStateHandler(u.states.PLAY_GAME, {
    'play': function() {
        const getCallback = (obj, err) => {
            if (err != null) {
                this.emit(':tell', 'Sorry, something went wrong trying to get your game information.  Try again in a few minutes');
                return;
            }
            if (obj == null || obj.entries.length === 0) {
                this.emit(':tell', 'You don\'t have any entries!  Ask me to add an entry to get started!');
                return;
            }
            const index = u.getRandomNumber(obj.entries.length);
            obj.lastEntry = obj.entries[index];

            obj.entries.splice(index, 1);

            const putCallback = (err) => {
                if (err) {
                    this.emit(':tell', 'Sorry, something went wrong trying to get your game information.  Try again in a few minutes');
                    return;
                }
                let str = `Can you guess who said, ${obj.lastEntry.fact} <break time="5s"/> three <break time="1s"/> two <break time="1s"/> one <break time="1s"/> It was ${obj.lastEntry.name}!`;
                if (obj.entries.length === 0) {
                    str = `${_getLastPrompt()}  ${str}`;
                }
                this.emit(':tell', str);
                return;
            };

            return s3.updateObject(this.event.context.System.user.userId, obj, putCallback.bind(this));
        };

        return s3.getGameInfo(this.event.context.System.user.userId, false, getCallback.bind(this));
    }
});

module.exports = { playNext };
