/* Copyright 2017 Cheryl Jennings */
/* eslint-disable no-console */

const nextGuess = (high, low) => {
    /* if the range doesn't make sense, return undefined to tell callers
     * the previous too high / low answer doesn't make sense
     */
    if (Math.abs(high - low) <= 1) {
        return NaN;
    }
    if ((high - low) === 2) {
        return (high - 1);
    }
    const guess = Math.floor((high - low) / 2) + low;
    const variance = Math.floor(Math.random() * ((high - low) * .3));
    const operator = Math.floor(Math.random() * 2);
    console.log(`High: ${high}, Low: ${low}, guess: ${guess}, variance: ${variance}, operator: ${operator}`);
    if (operator === 1) {
        if ((guess + variance) >= high) {
            return guess;
        }
        return (guess + variance);
    }
    if ((guess - variance) <= low) {
        return guess;
    }
    return (guess - variance);
};

module.exports = { nextGuess };
