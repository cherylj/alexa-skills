// Copyright 2017 Cheryl Jennings
const prompts = {
    'helpText': 'Start a new game by asking me to think of a number, or say I\'m thinking of a number between 1 and 100',
    'confirmStartOver': 'Do you want to end the current game and start a new one?',
    'rangePrefix': 'I\'m thinking of a number between '
};

const goodByes = [
    '<say-as interpret-as="interjection">arrivederci</say-as>',
    '<say-as interpret-as="interjection">au revoir</say-as>',
    '<say-as interpret-as="interjection">bummer.</say-as> See you later!',
    '<say-as interpret-as="interjection">whoops a daisy.</say-as> Guess our time is up!  See you later!',
    '<say-as interpret-as="interjection">righto.</say-as> See you next time!',
    '<say-as interpret-as="interjection">wah wah</say-as>.  Time to go. See you next time!',
    '<say-as interpret-as="interjection">shucks.</say-as> I wish we could play more.  Come play again soon!',
    'Thanks for playing!  Goodbye!',
    'See you next time!',
    'Bye bye!',
    'Come back soon, I\'ve got lots more numbers for you to guess',
    'Going so soon?  I\'ll miss you!',
    'I\'ve had fun, let\'s play again soon!'
];

const getRandomGoodbye = () => {
    return goodByes[Math.floor(Math.random() * goodByes.length)];
};

const greetings = [
    '<say-as interpret-as="interjection">ahoy</say-as>',
    '<say-as interpret-as="interjection">bonjour</say-as>',
    'It\'s time to guess some secret numbers!  <break strength="strong"/> <say-as interpret-as="interjection">dynomite</say-as>',
    '<say-as interpret-as="interjection">howdy</say-as>',
    '<say-as interpret-as="interjection">hurray</say-as> <break strength="strong"/> I\'m glad you\'re here!',
    '<say-as interpret-as="interjection">oh snap</say-as><break strength="strong"/>  It\'s secret number guessing time',
    '<say-as interpret-as="interjection">wahoo</say-as><break strength="strong"/> let\'s guess some secret numbers.',
    'Welcome!',
    'Welcome to Secret Numbers!',
    'It\'s Secret Numbers!  <say-as interpret-as="interjection">yay</say-as>',
    '<say-as interpret-as="interjection">yippie</say-as><break strength="strong"/> I\'ve been wanting to play all day!'
];

const getRandomGreeting = () => {
    return greetings[Math.floor(Math.random() * greetings.length)];
};

const oopsies = [
    '<say-as interpret-as="interjection">ruh roh.</say-as>',
    '<say-as interpret-as="interjection">wah wah.</say-as>',
    '<say-as interpret-as="interjection">uh oh</say-as>.',
    '<say-as interpret-as="interjection">blast</say-as>.',
    '<say-as interpret-as="interjection">blarg</say-as>.',
    '<say-as interpret-as="interjection">argh</say-as>.',
    'wait,',
    'hold on,'
];

const getRandomOops = () => {
    return oopsies[Math.floor(Math.random() * oopsies.length)];
};

const yays = [
    '<say-as interpret-as="interjection">yay</say-as>.',
    'Awesome!',
    'Cool!',
    'Sweet!',
    '<say-as interpret-as="interjection">yippee</say-as>.',
    '<say-as interpret-as="interjection">woo hoo</say-as>.',
    '<say-as interpret-as="interjection">wahoo</say-as>.',
    '<say-as interpret-as="interjection">hurray</say-as>.',
    '<say-as interpret-as="interjection">dynomite</say-as>.',
    '<say-as interpret-as="interjection">boom</say-as>.'
];

const getRandomYay = () => {
    return yays[Math.floor(Math.random() * yays.length)];
};

const goodJobs = [
    '<say-as interpret-as="interjection">well done</say-as>.',
    '<say-as interpret-as="interjection">way to go</say-as>.',
    '<say-as interpret-as="interjection">hurray</say-as>.',
    '<say-as interpret-as="interjection">bravo</say-as>.',
    'Great job.',
    'Good guessing!',
    'Excellent job!'
];

const getRandomGoodJob = () => {
    return goodJobs[Math.floor(Math.random() * goodJobs.length)];
};

module.exports = { prompts, getRandomGoodbye, getRandomGreeting, getRandomOops, getRandomYay, getRandomGoodJob };
