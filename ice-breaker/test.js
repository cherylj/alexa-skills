/* Copyright 2017 Cheryl Jennings */
/* eslint-disable no-console, no-unused-vars */
'use strict';

const util = require('./lib/_util');
const s3 = require('./lib/_s3');

// console.log(util.getIntent('yes')); // eslint-disable-line no-console

// console.log(`keys are: ${Object.keys(addHandlers)}`);
const callback = (err) => {
    if (err) {
        console.log(`Received code: ${err.statusCode}.  Its type is: ${err.statusCode === 404}`); // eslint-disable-line no-console
    } else {
        console.log('No error received'); // eslint-disable-line no-console
    }
};

const createCallback = (err) => {
    if (err) {
        console.log('Sorry, something went wrong trying to create your game.  Try again in a few minutes');
    }
    console.log('Game created!');
};

const checkExistsCallback = (obj, err) => {
    if (err) {
        if (err.code === 'NoSuchKey' || err.code === 'NotFound') {
            // Doesn't exist already, go ahead and create!
            return s3.createNewGame('abc', false, createCallback);
        }
        console.log(`Sorry, encountered an error: ${err}`);
    }

    const count = obj.count;
    console.log(`COUNT WAS: ${count}`);
    if (!count || count === 0) {
        return s3.createNewGame('abc', true, createCallback);
    }
    console.log(`You currently have a game with ${count} entries.  Do you want to delete it and start a new game?`);
};
//s3.getGameInfo('abc', true, checkExistsCallback);
//console.log(util.getRandomNumber(100));
// s3.getGameInfo('abc', callback); // eslint-disable-line no-console
//s3.createNewGame('abc', true, callback); // eslint-disable-line no-console

console.log('------- after get info ----------');
console.log(util.intents.FULL_HELP);
//console.log(`intent was: ${intent} and state is: ${util.getStateForIntent(intent)}`);
