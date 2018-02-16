'use strict';

const {promisify} = require('es6-promisify');
const squad = require('squad/legacy');
const currify = require('currify/legacy');
const tryToCatch = require('try-to-catch/legacy');
const stringToStream = require('string-to-stream');

const dropbox = require('./dropbox');
const {
    checkToken,
    checkPath,
    checkFn,
} = require('./check');

const readDir = promisify(dropbox.readDir);
const readFile = promisify(dropbox.readFile);
const getError = dropbox._getError;

const good = currify((fn, a) => fn(null, a));
const stringify = (json) => JSON.stringify(json, null, 4)
const streamJson = squad(stringToStream, stringify);

module.exports = (accessToken, path, options, fn) => {
    if (!fn) {
        fn = options;
        options = {};
    }
    
    checkToken(accessToken);
    checkPath(path);
    checkFn(fn);
    
    read(accessToken, path, options)
        .then(good(fn))
        .catch(getError)
        .catch(fn)
};

async function read(accessToken, path, options) {
    const [error, list] = await tryToCatch(readDir, accessToken, path, options);
    
    if (!error)
        return streamJson(list);
    
    if (error.message.indexOf('path/not_folder/'))
        throw error;
    
    return await readFile(accessToken, path);
}

