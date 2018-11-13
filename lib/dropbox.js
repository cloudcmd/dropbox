'use strict';

const {Dropbox} = require('dropbox');
const dropboxStream = require('dropbox-stream');
const dropboxify = require('dropboxify');
const fetch = require('node-fetch');

const getDropbox = (accessToken) => {
    return new Dropbox({
        accessToken,
        fetch,
    });
};

const ewrap = (promise) => (...args) => {
    return promise(...args)
        .catch(getError);
}

module.exports.readFile = ewrap(async (token, path) => {
    checkToken(token);
    checkPath(path);
    
    const dbx = getDropbox(token);
    
    const {link} = await dbx.filesGetTemporaryLink({path})
    const {body} = await fetch(link);
   
    return body;
});

module.exports.writeFile = ewrap(async (token, path, contents = '') => {
    checkToken(token);
    checkPath(path);
    
    const dbx = getDropbox(token);
    const file = {
        path,
        contents,
        mode: {
            '.tag': 'overwrite',
        }
    };
    
    return dbx.filesUpload(file);
});

module.exports.createWriteStream = (token, path) => {
    checkToken(token);
    checkPath(path);
    
    return dropboxStream.createDropboxUploadStream({
        token,
        path,
        autorename: false,
        mode: 'overwrite',
        chunkSize: 1000 * 1024,
    });
};

module.exports.createReadStream = (token, path) => {
    checkToken(token);
    checkPath(path);
    
    return dropboxStream.createDropboxDownloadStream({
        token,
        path,
    });
};

module.exports.readDir = ewrap(async (token, path, options = {}) => {
    checkToken(token);
    checkPath(path);
    
    return dropboxify(token, path, options);
});

module.exports.mkdir = ewrap(async (token, path) => {
    checkToken(token);
    checkPath(path);
    
    const dbx = getDropbox(token);
    return dbx.filesCreateFolderV2({path});
});

module.exports.copy = ewrap(async (token, from, to) => {
    checkToken(token);
    checkFrom(from);
    checkTo(to);
    
    const dbx = getDropbox(token);
    
    const filesRelocation = {
        from_path: from,
        to_path: to,
    };
    
    return dbx.filesCopyV2(filesRelocation)
});

module.exports.move = ewrap(async (token, from, to) => {
    checkToken(token);
    checkFrom(from);
    checkTo(to);
    
    const dbx = getDropbox(token);
    
    const filesRelocation = {
        from_path: from,
        to_path: to,
    };
    
    return dbx.filesMoveV2(filesRelocation)
});

module.exports.remove = ewrap((token, path) => {
    checkToken(token);
    checkPath(path);
    
    const dbx = getDropbox(token);
    return dbx.filesDeleteV2({path})
});

function getError(e) {
    if (e instanceof Error)
        throw e;
    
    if (typeof e.error === 'string')
        throw Error(e.error);
    
    if (e.error.error_summary.includes('path/conflict/folder/'))
        return;
    
    throw Error(e.error.error_summary);
}

function checkToken(token) {
    if (typeof token !== 'string')
        throw Error('token should be a string!');
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

