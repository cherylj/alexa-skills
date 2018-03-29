/* Copyright 2017 Cheryl Jennings */
'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const keys = require('../keys');

const baseConfig = {
    count: 0,
    entries: []
};

const getGameInfo = (userId, createNew, func) => {
    const s3promise = s3.headObject({ Bucket: keys.bucketName, Key: userId }).promise();
    return s3promise.then((data) => {
        console.log(data);
        func(JSON.parse(data.Body.toString()));
    }, (err) => {
        if (createNew && (err.code === 'NoSuchKey' || err.code === 'AccessDenied')) {
            const readAfterCreate = (err) => {
                if (err) {
                    return func(null, err);
                }
                return getGameInfo(userId, false, func);
            };

            return createNewGame(userId, false, readAfterCreate);
        }
        return func(null, err);
    });
};

const createNewGame = (userId, shouldDelete, func) => {
    const createFunc = () => {
        // Create new bucket.
        const params = {
            Body: JSON.stringify(baseConfig),
            Bucket: keys.bucketName,
            Key: userId
        };

        s3.putObject(params, (err) => {
            return func(err);
        });
    };

    if (shouldDelete) {
        const params = {
            Bucket: keys.bucketName,
            Key: userId
        };

        return s3.deleteObject(params, (err) => {
            if (err) {
                if (err.code !== 'NoSuchKey') {
                    return func(err);
                }
                // Wasn't found, don't care that it was an error.
            }

            return createFunc();
        });
    }

    return createFunc();
};

const deleteGame = (userId, func) => {
    const params = {
        Bucket: keys.bucketName,
        Key: userId
    };

    return s3.deleteObject(params, (err) => {
        if (err) {
            if (err.code !== 'NoSuchKey') {
                return func(err);
            }
        }
        return func();
    });
}

const updateObject = (userId, json, func) => {
    const params = {
        Body: JSON.stringify(json),
        Bucket: keys.bucketName,
        Key: userId
    };

    return s3.putObject(params, (err) => {
        return func(err);
    });
};

module.exports = { getGameInfo, createNewGame, updateObject };
