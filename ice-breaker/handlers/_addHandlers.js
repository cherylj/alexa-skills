/* Copyright 2017 Cheryl Jennings */
/* eslint-disable no-console */

var Alexa = require('alexa-sdk');
const u = require('../lib/_util');
const s3 = require('../lib/_s3');

const _getNamePrompt = () => {
    const prompts = [
        'Okay, what\'s your name?',
        'Sure, tell me your name',
        'Alright, what\'s your name?'
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
};

const _getFactPrompt = () => {
    const prompts = [
        'Great, tell me something about you.',
        'Got it!  Now, what\'s your fact?',
        'Super, can you tell me your fact?',
        'Cool.  What\'s your fact?'
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
};

const _getSuccessPrompt = () => {
    const prompts = [
        'Got it.  You\'re all set!',
        'I\'ve saved your fact, you\'re good to go!',
        'Awesome, I\'ve saved your info!'
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
};

const _getOopsPrompt = () => {
    const prompts = [
        '<say-as interpret-as="interjection">d’oh</say-as>.',
        '<say-as interpret-as="interjection">whoops a daisy</say-as>.',
        '<say-as interpret-as="interjection">darn</say-as>.',
        'My bad.',
        'Oops, sorry.'
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
};

const _getExampleFact = () => {
    const prompts = [
        'I have twenty cats',
        'My favorite ice cream flavor is pistachio',
        'My favorite song is Whip It by Devo'
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
};

const _doesNameExist = (name, json) => {
    for(let i = 0; i < json.entries.length; i++) {
        if(json.entries[i].name === name) {
            return true;
        }
    }
    return false;
};

const addName = Alexa.CreateStateHandler(u.states.ADD_NAME, {
    // TODO add check for max entries
    'add': function() {
        const getJson = (json, err) => {
            if (err) {
                this.emit(':tell', 'Sorry, I\'m having problems accesing your account.  Please try again');
            }
            this.attributes['json'] = json;
            this.handler.state = u.states.PROMPT_NAME;
            this.emit(':ask', _getNamePrompt());
        };

        if (!this.attributes['json']) {
            return s3.getGameInfo(this.event.context.System.user.userId, true, getJson.bind(this));
        }

        this.handler.state = u.states.PROMPT_NAME;
        this.emit(':ask', _getNamePrompt());
    },
    'reprompt': function() {
        this.handler.state = u.states.PROMPT_NAME;
        if (this.attributes['getLastName']) {
            this.emit(':ask', _getOopsPrompt() + '  Try telling me your last name again.');
        }
        this.emit(':ask', _getOopsPrompt() + '  Try telling me your name again.');
    }
});

const promptName = Alexa.CreateStateHandler(u.states.PROMPT_NAME, {
    'blank': function() {
        this.handler.state = u.states.CONFIRM_NAME;
        const utterance = this.event.request.intent.slots.fact.value;

        if (this.attributes['getLastName']) {
            this.attributes['lastName'] = utterance.toLowerCase();
            this.emit(':ask', `I got that your last name was ${utterance}.  Is that correct?`);
            return;
        }
        this.attributes['name'] = utterance.toLowerCase();
        this.emit(':ask', `I got that your name was ${utterance}.  Is that correct?`);
    },
    'AMAZON.HelpIntent': function() {
        const helpStr = 'Say your name so I can create an entry for you.  Say cancel to cancel this entry.';
        if (this.attributes['getLastName']) {
            helpStr = 'Say your last name so I can create an entry for you with a unique name.  Say cancel to cancel this entry.';
        }
        this.emit(':ask', helpStr);
    },
    'Unhandled': function() {
        const helpStr = 'Sorry, I didn\'t get that.  What\'s your name?';
        if (this.attributes['getLastName']) {
            helpStr = 'Sorry, I didn\'t get that.  What\'s your last name?';
        }
        this.emit(':ask', helpStr);
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', 'goodbye');
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', 'goodbye');
    }
});

const confirmName = Alexa.CreateStateHandler(u.states.CONFIRM_NAME, {
    'blank': function() {
        this.emit(':ask', `Sorry, I didn't get that.  Is your name ${this.attributes['name']}?`);
    },
    'AMAZON.NoIntent': function() {
        this.handler.state = u.states.ADD_NAME;
        if (this.attributes['getLastName']) {
            this.attributes['lastName'] = undefined;
        } else {
            this.attributes['name'] = undefined;
        }
        this.emitWithState(u.intents.REPROMPT);
    },
    'AMAZON.YesIntent': function() {
        this.handler.state = u.states.ADD_FACT;

        if (this.attributes['getLastName']) {
            this.attributes['name'] = `${this.attributes['name']} ${this.attributes['lastName']}`;
        } else if(_doesNameExist(this.attributes['name'], this.attributes['json'])) {
            this.handler.state = u.states.PROMPT_NAME;
            this.attributes['getLastName'] = true;
            this.attributes['lastName'] = undefined;
            this.emit(':ask', `I already have a name of ${this.attributes['name']} in this game.  What's your last name?`);
        }
        this.emitWithState(u.intents.ADD);
    },
    'AMAZON.HelpIntent': function() {
        const helpStr = `If your name is ${this.attributes['name']}, say yes.  Otherwise you can say no and try again.  Say cancel to cancel this entry.`;
        if (this.attributes['getLastName']) {
            helpStr = `If your last name is ${this.attributes['lastName']}, say yes.  Otherwise you can say no and try again.  Say cancel to cancel this entry.`
        }
        this.emit(':ask', helpStr);
    },
    'Unhandled': function() {
        const helpStr = `Sorry, I didn't get that.  Is your name ${this.attributes['name']}?`;
        if (this.attributes['getLastName']) {
            helpStr = `Sorry, I didn't get that.  Is your last name ${this.attributes['lastName']}?`;
        }
        this.emit(':ask', helpStr);
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', 'goodbye');
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', 'goodbye');
    }
});

const addFact = Alexa.CreateStateHandler(u.states.ADD_FACT, {
    'add': function() {
        this.handler.state = u.states.PROMPT_FACT;
        this.emit(':ask', _getFactPrompt());
    },
    'reprompt': function() {
        this.handler.state = u.states.PROMPT_FACT;
        this.emit(':ask', _getOopsPrompt() + '  Try telling me your fact again.');
    }
});

const promptFact = Alexa.CreateStateHandler(u.states.PROMPT_FACT, {
    'blank': function() {
        // TODO check for help?
        this.handler.state = u.states.CONFIRM_FACT;
        const utterance = this.event.request.intent.slots.fact.value;
        this.attributes['fact'] = utterance;
        this.emit(':ask', `I got that your fact was ${utterance}.  Is that correct?`);
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', `Tell me something about you.  People will try and guess who said it.  For example, you can say, ${_getExampleFact()}`);
    },
    'Unhandled': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that.  What\'s your fact?');
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', 'goodbye');
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', 'goodbye!');
    }
});

const confirmFact = Alexa.CreateStateHandler(u.states.CONFIRM_FACT, {
    'blank': function() {
        this.emit(':ask', `Sorry, I didn't get that.  Is your fact ${this.attributes['fact']}?`);
    },
    'AMAZON.NoIntent': function() {
        this.handler.state = u.states.ADD_FACT;
        this.attributes['fact'] = undefined;
        this.emitWithState(u.intents.REPROMPT);
    },
    'AMAZON.YesIntent': function() {
        const json = this.attributes['json'];
        if (util.getRandomNumber(1) === 0) {
            json.entries.push( {
                'name': this.attributes['name'],
                'fact': this.attributes['fact']
            } );
        } else {
            json.entries.unshift( {
                'name': this.attributes['name'],
                'fact': this.attributes['fact']
            } );
        }
        json.count++;

        const callback = (err) => {
            if(err) {
                this.emit(':tell', 'Oops, I encountered an error trying to record your fact.  Please try again');
            }
            this.emit(':tell', _getSuccessPrompt() + `  Your name is: ${this.attributes['name']} and your fact was: ${this.attributes['fact']}`);
        };

        return s3.updateObject(this.event.context.System.user.userId, json, callback.bind(this));
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'you asked for help');
    },
    'Unhandled': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that.  What\'s your fact?');
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', 'goodbye');
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', 'goodbye!');
    }
});

module.exports = { addName, promptName, confirmName, addFact, promptFact, confirmFact };
