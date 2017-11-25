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
    'So long and thanks for all the fish.',
    'I\'ve had fun.<break strength="strong"/> This has been good.'
];

const getRandomGoodbye = () => {
    return goodByes[Math.floor(Math.random() * goodByes.length)];
};

const greetings = [
    '<say-as interpret-as="interjection">ahoy</say-as>',
    '<say-as interpret-as="interjection">bonjour</say-as>',
    'It\'s time to guess some numbers!  <break strength="strong"/> <say-as interpret-as="interjection">dynomite</say-as>',
    '<say-as interpret-as="interjection">howdy</say-as>',
    '<say-as interpret-as="interjection">hurray</say-as> <break strength="strong"/> I\'m glad you\'re here!',
    '<say-as interpret-as="interjection">oh snap</say-as><break strength="strong"/>  It\'s number guessing time',
    '<say-as interpret-as="interjection">wahoo</say-as><break strength="strong"/> let\'s guess some numbers.',
    'Welcome!',
    'Welcome to the number guessing game!',
    'It\'s the number guessing game!  <break strength="strong"/><say-as interpret-as="interjection">yay</say-as>',
    '<say-as interpret-as="interjection">yippie</say-as><break strength="strong"/> I\'ve been wanting to play all day!'
];

const getRandomGreeting = () => {
    return greetings[Math.floor(Math.random() * greetings.length)];
};

module.exports = { prompts, getRandomGoodbye, getRandomGreeting };
