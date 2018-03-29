/* Copyright 2018 Cheryl Jennings */
'use strict';

const states = {
    ADD_NAME: 'addName',
    PROMPT_NAME: 'promptName',
    CONFIRM_NAME: 'confirmName',
    UPDATE_NAME: 'updateName',
    ADD_FACT: 'addFact',
    PROMPT_FACT: 'promptFact',
    CONFIRM_FACT: 'confirmFact',
    DELETE_GAME: 'deleteGame',
    START_GAME: 'startGame',
    CONFIRM_START: 'confirmStart',
    CONFIRM_DELETE: 'confirmDelete',
    NO_STATE: 'noState'
};

const intents = {
    START_NEW: 'startNew',
    DELETE: 'delete',
    ADD: 'add',
    PLAY: 'play',
    YES: 'AMAZON.YesIntent',
    NO: 'AMAZON.NoIntent',
    HELP: 'AMAZON.HelpIntent',
    REPROMPT: 'reprompt', // not actually used by user.
    REPROMPT_FOR_LAST: 'get_last', // not actually used by user.
    UNDEFINED: 'Unhandled'
};

const intentMap = [
    [intents.START_NEW, ['start new', 'new ice breaker', 'start new ice breaker', 'start new game']],
    [intents.DELETE, ['remove ice breaker', 'delete ice breaker']],
    [intents.ADD, ['add fact', 'add a fact', 'add new fact', 'add a new fact',
        'add person', 'add a person', 'add entry', 'add an entry', 'add new entry', 'add a new entry']],
    [intents.PLAY, ['give me a fact', 'next fact']],
    [intents.YES, ['yes', 'yeah', 'correct', 'that\'s correct', 'that\'s right']],
    [intents.NO, ['no', 'nope', 'that\'s not right', 'incorrect'],
    [intents.HELP, ['help', 'help me']]]
];

const intentToStateMap = new Map([
    [intents.ADD, states.ADD_NAME],
    [intents.DELETE, states.START_GAME],
    [intents.START_NEW, states.START_GAME],
    [intents.PLAY, states.PLAY]
]);

const getStateForIntent = (intent) => {
    return(intentToStateMap.get(intent));
};

const getIntent = (phrase) => {
    phrase = phrase.toLowerCase();
    for (let i = 0; i < intentMap.length; i ++) {
        const utterances = intentMap[i][1];
        for (let j = 0; j < utterances.length; j++) {
            if (phrase === utterances[j]) {
                return intentMap[i][0];
            }
        }
    }

    return intents.UNDEFINED;
};

const getRandomNumber = (max) => {
    return Math.floor((Math.random() * Date.now() & 0xFF) % max);
}

module.exports = { states, intents, getIntent, getStateForIntent, getRandomNumber };
