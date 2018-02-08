'use strict';

const {promisify} = require('es6-promisify');
const currify = require('currify/legacy');
const Readable = require('stream').Readable;

const dropbox = require('./dropbox');
const readDir = promisify(dropbox.readDir);
const readFile = promisify(dropbox.readFile);
const getError = dropbox._getError;

const good = currify((fn, a) => fn(null, a));
const {stringify} = JSON;

module.exports = (accessToken, path, options, fn) => {
    if (!fn) {
        fn = options;
        options = {};
    }
    
    read(accessToken, path, options)
        .then(good(fn))
        .catch(getError)
        .catch(fn)
};

async function read(accessToken, path, options) {
    const [error, list] = await tryPromise(readDir, accessToken, path, options);
    
    if (!error)
        return streamify(list);
    
    if (error.message.indexOf('path/not_folder/'))
        throw error;
    
    return await readFile(accessToken, path);
}

async function tryPromise(promise, ...a) {
    try {
        return [null, await promise(...a)];
    } catch(e) {
        return [e];
    }
}

function streamify(json) {
    const stream = new Readable();
    const str = stringify(json, null, 4)
    
    stream.push(str);
    stream.push(null);
    
    return stream;
}

