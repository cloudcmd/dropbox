'use strict';

require('isomorphic-fetch');

const Dropbox = require('dropbox');
const currify = require('currify/legacy');
const promisify = require('es6-promisify').promisify;
const dropboxStream = require('dropbox-stream');

const dropboxify = promisify(require('dropboxify'));
const good = currify((fn, a) => fn(null, a));

const getDropbox = (accessToken) => {
    return new Dropbox.Dropbox({
        accessToken
    });
};

const getLink = (file) => file.link;
const getBody = (file) => file.body;

module.exports.readFile = (token, path, fn) => {
    checkToken(token);
    checkPath(path);
    checkFn(fn);
    
    const dbx = getDropbox(token);
    
    dbx.filesGetTemporaryLink({path})
        .then(getLink)
        .then(fetch)
        .then(getBody)
        .then(good(fn))
        .catch(getError)
        .catch(fn);
};

module.exports.writeFile = (token, path, contents, fn) => {
    contents = contents || '';
    
    checkToken(token);
    checkPath(path);
    checkFn(fn);
    
    const dbx = getDropbox(token);
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

module.exports.createWriteStream = (token, filepath) => {
    checkToken(token);
    checkPath(filepath);
    
    return dropboxStream.createDropboxUploadStream({
        token,
        filepath,
        chunkSize: 1000 * 1024,
    });
};

module.exports.createReadStream = (token, filepath) => {
    checkToken(token);
    checkPath(filepath);
    
    return dropboxStream.createDropboxDownloadStream({
        token,
        filepath,
    });
};

module.exports.readDir = (token, path, options, fn) => {
    if (!fn) {
        fn = options;
        options = {};
    }
    
    checkToken(token);
    checkPath(path);
    checkFn(fn);
    
    dropboxify(token, path, options)
        .then(good(fn))
        .catch(getError)
        .catch(fn);
};

module.exports.copy = (token, from, to, fn) => {
    checkToken(token);
    checkFrom(from);
    checkTo(to);
    checkFn(fn);
    
    const dbx = getDropbox(token);
    
    const filesRelocation = {
        from_path: from,
        to_path: to,
    };
    
    return dbx.filesCopyV2(filesRelocation)
        .then(good(fn))
        .catch(getError)
        .catch(fn);
};

module.exports.move = (token, from, to, fn) => {
    checkToken(token);
    checkFrom(from);
    checkTo(to);
    checkFn(fn);
    
    const dbx = getDropbox(token);
    
    const filesRelocation = {
        from_path: from,
        to_path: to,
    };
    
    return dbx.filesMoveV2(filesRelocation)
        .then(good(fn))
        .catch(getError)
        .catch(fn);
};

module.exports.delete = (token, path, fn) => {
    checkToken(token);
    checkPath(path);
    checkFn(fn);
    
    const dbx = getDropbox(token);
    
    return dbx.filesDeleteV2({path})
        .then(good(fn))
        .catch(getError)
        .catch(fn);
};

module.exports._getError = getError;
function getError(e) {
    if (e instanceof Error)
        throw e;
    
    if (typeof e.error === 'string')
        throw Error(e.error);
    
    throw Error(e.error.error_summary);
}

function checkToken(token) {
    if (typeof token !== 'string')
        throw Error('token should be a string!');
}

function checkFn(fn) {
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

