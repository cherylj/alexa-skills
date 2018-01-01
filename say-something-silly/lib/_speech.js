/* Copyright 2017 Cheryl Jennings */
'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const keys = require('../keys');
const multiplier = ((Date.now() & 0xFFF) * Math.random());
//console.log(`multiplier is ${multiplier}`);  // eslint-disable-line no-console

const getRandomNumber = (max) => {
    const num = Math.floor((Math.random() * multiplier) + (Math.random() * (multiplier - 1)) + (Math.random() * (multiplier - 2))) % max;
    //console.log(`Random number from ${max} is ${num}`);  // eslint-disable-line no-console
    return num;
};

const goodByes = [
    'Why did you wake me up?',
    'Going so soon?',
    'Ok, bye',
    'Bye bye',
    'I\'ll see myself out',
    'Acknowledged'
];

const errors = [
    'Sorry, I don\'t feel like it right now',
    'No thanks',
    'Oops, I\'m not feeling so well right now',
    'Magic eight ball says ask again later',
    'I can\'t do that, Dave',
    'I\'m too tired to do that right now, sorry',
    'Can\'t a girl get some space!?',
    'Make me.'
];

const getRandomText = (arr) => {
    return arr[getRandomNumber(arr.length)];
};

const getRandomGoodbye = () => getRandomText(goodByes);

const getTemplate = () => {
    let json;
    let template;

    // Get the S3 object
    const s3promise = s3.getObject({ Bucket: keys.bucketName, Key: keys.bucketKey }).promise();
    return s3promise.then((data) => {
        json = JSON.parse(data.Body.toString());
        // console.log(`number of templates: ${json.templates.length}`);  // eslint-disable-line no-console
        template = json.templates[getRandomNumber(json.templates.length)];
        if (json.test) {
            return json.test;
        }
        return template;
    }, (err) => {
        throw err;
    });
};

const getSillyText = (func) => {
    getTemplate().then((template) => {
        let str = template.parts[0];
        for(let i = 1; i < template.parts.length; i++) {
            str += getRandomText(template.substitutions[i - 1]);
            str += template.parts[i];
        }
        func(str);
    }).catch((err) => {
        // console.log(err)  // eslint-disable-line no-console
        func(getRandomText(errors));
    });
};


const validateJson = () => {
    // Get the S3 object
    const s3promise = s3.getObject({ Bucket: keys.bucketName, Key: keys.bucketKey }).promise();
    s3promise.then((data) => {
        const json = JSON.parse(data.Body.toString());
        // console.log(`number of templates: ${json.templates.length}`);  // eslint-disable-line no-console
        for (let i = 0; i < json.templates.length; i++) {
            if (!json.templates[i].parts) {
                console.log(`Missing parts for index ${i}`);
                console.log(json.templates[i]);
                continue;
            }
            if (json.templates[i].parts.length == 1) {
                continue;
            }
            if (!json.templates[i].substitutions) {
                console.log(`Missing substitutions for index ${i}`);
                console.log(json.templates[i]);
                continue;
            }

            if (json.templates[i].parts.length != (json.templates[i].substitutions.length + 1)) {
                console.log(`Mismatched lengths for index ${i}`);
                console.log(json.templates[i]);
            }
        }
    }, (err) => {
        console.log(`encountered error: ${err}`);
    });
};

module.exports = { getSillyText, getRandomGoodbye, validateJson };
