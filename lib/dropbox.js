'use strict';

require('isomorphic-fetch');

const Dropbox = require('dropbox');
const currify = require('currify/legacy');
const promisify = require('es6-promisify').promisify;

const dropboxify = promisify(require('dropboxify'));

const good = currify((fn, a) => fn(null, a));

const getDropbox = (accessToken) => {
    return new Dropbox.Dropbox({
        accessToken
    });
};

const getLink = (file) => file.link;
const getBody = (file) => file.body;

module.exports.readFile = (accessToken, path, fn) => {
    check(accessToken, fn);
    checkPath(path);
    
    const dbx = getDropbox(accessToken);
    
    dbx.filesGetTemporaryLink({path})
        .then(getLink)
        .then(fetch)
        .then(getBody)
        .then(good(fn))
        .catch(getError)
        .catch(fn);
};

module.exports.writeFile = (accessToken, path, contents, fn) => {
    contents = contents || '';
    
    check(accessToken, fn);
    checkPath(path);
    
    const dbx = getDropbox(accessToken);
    const file = {
        path,
        contents,
        mode: {
            '.tag': 'overwrite',
        }
    };
    
    dbx.filesUpload(file)
        .then(good(fn))
        .catch(getError)
        .catch(fn);
};

module.exports.readDir = (accessToken, dir, options, fn) => {
    if (!fn) {
        fn = options;
        options = {};
    }
    
    check(accessToken, fn);
    checkPath(dir);
    
    dropboxify(accessToken, dir, options)
        .then(good(fn))
        .catch(getError)
        .catch(fn);
};

module.exports.copy = (accessToken, from, to, fn) => {
    check(accessToken, fn);
    checkFrom(from);
    checkTo(to);
    
    const dbx = getDropbox(accessToken);
    
    const filesRelocation = {
        from_path: from,
        to_path: to,
    };
    
    return dbx.filesCopyV2(filesRelocation)
        .then(good(fn))
        .catch(getError)
        .catch(fn);
};

module.exports.move = (accessToken, from, to, fn) => {
    check(accessToken, fn);
    checkFrom(from);
    checkTo(to);
    
    const dbx = getDropbox(accessToken);
    
    const filesRelocation = {
        from_path: from,
        to_path: to,
    };
    
    return dbx.filesMoveV2(filesRelocation)
        .then(good(fn))
        .catch(getError)
        .catch(fn);
};

module.exports.delete = (accessToken, path, fn) => {
    check(accessToken, fn);
    checkPath(path);
    
    const dbx = getDropbox(accessToken);
    
    return dbx.filesDeleteV2({path})
        .then(good(fn))
        .catch(getError)
        .catch(fn);
};

module.exports.read = require('./read');

module.exports._getError = getError;
function getError(e) {
    if (e instanceof Error)
        throw e;
    
    if (typeof e.error === 'string')
        throw Error(e.error);
    
    throw Error(e.error.error_summary);
}

function check(accessToken, fn) {
    if (typeof accessToken !== 'string')
        throw Error('accessToken should be a string!');
    
    if (typeof fn !== 'function')
        throw Error('fn should be a function!');
}

function checkFrom(from) {
    if (typeof from !== 'string')
        throw Error('from should be a string!');
}

function checkTo(to) {
    if (typeof to !== 'string')
        throw Error('to should be a string!');
}

function checkPath(path) {
    if (typeof path !== 'string')
        throw Error('path should be a string!');
}

