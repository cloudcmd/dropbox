'use strict';

const test = require('tape');
const dropbox = require('..');
const stringToStream = require('string-to-stream');
const pullout = require('pullout');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const tryToCatch = require('try-to-catch');
const mockRequire = require('mock-require');

const {reRequire} = mockRequire;

const {
    writeFile,
    readDir,
    copy,
} = dropbox;

test('dropbox: readDir: no token', async (t) => {
    const [e] = await tryToCatch(readDir);
    
    t.equal(e.message, 'token should be a string!', 'should throw when no token');
    t.end();
});

test('dropbox: readDir: no path', async (t) => {
    const [e] = await tryToCatch(readDir, '');
    
    t.equal(e.message, 'path should be a string!', 'should throw when no dir');
    t.end();
});

test('dropbox: readDir: dropboxify: call', async (t) => {
    const path = '/';
    const dropboxify = sinon.stub()
        .returns(Promise.resolve());
    
    mockRequire('dropboxify', dropboxify);
    
    const {readDir} = reRequire('..');
    
    await readDir('token', path);
    
    const args = [
        'token',
        '/',
        {},
    ];
    
    t.ok(dropboxify.calledWith(...args), 'should call dropboxify');
    t.end();
});

test('dropbox: read: dropboxify: call: options', async (t) => {
    const path = '/';
    const dropboxify = sinon.stub().returns(Promise.resolve());
    
    mockRequire('dropboxify', dropboxify);
    
    const {readDir} = reRequire('..');
    await readDir('token', path, {raw: true}, sinon.stub());
    
    const args = [
        'token',
        '/', {
            raw: true
        },
    ];
    
    t.ok(dropboxify.calledWith(...args), 'should call dropboxify');
    t.end();
});

test('dropbox: createWriteStream: no token', (t) => {
    t.throws(dropbox.createWriteStream, /token should be a string!/, 'should throw when no token');
    t.end();
});

test('dropbox: createWriteStream: no path', (t) => {
    const fn = () => dropbox.createWriteStream('token');
    
    t.throws(fn, /path should be a string!/, 'should throw when no path');
    t.end();
});

test('dropbox: createWriteStream: createDropboxUploadStream', (t) => {
    const createDropboxUploadStream = sinon.stub();
    
    mockRequire('dropbox-stream', {
        createDropboxUploadStream
    });
    
    const token = 'token';
    const filepath = '/hello';
    const chunkSize = 1024000;
    
    const {createWriteStream} = reRequire('..');
    
    createWriteStream(token, filepath);
    const expected = {
        token,
        filepath,
        chunkSize,
    };
    
    t.ok(createDropboxUploadStream.calledWith(expected), 'should call createDropboxUploadStream');
    t.end();
});

test('dropbox: createWriteStream: result', (t) => {
    const str = 'hello';
    const createDropboxUploadStream = sinon
        .stub()
        .returns(stringToStream(str));
    
    mockRequire('dropbox-stream', {
        createDropboxUploadStream
    });
    
    const token = 'token';
    const filepath = '/hello';
    const {createWriteStream} = reRequire('../lib/dropbox');
    
    const stream = createWriteStream(token, filepath);
    
    pullout(stream, 'string', (e, data) => {
        t.equal(data, str, 'should equal');
        t.end();
    });
});

test('dropbox: createReadStream: no token', (t) => {
    t.throws(dropbox.createWriteStream, /token should be a string!/, 'should throw when no token');
    t.end();
});

test('dropbox: createReadStream: no path', (t) => {
    const fn = () => dropbox.createWriteStream('token');
    
    t.throws(fn, /path should be a string!/, 'should throw when no path');
    t.end();
});

test('dropbox: createReadStream: createDropboxDownloadStream', (t) => {
    const createDropboxDownloadStream = sinon.stub();
    
    mockRequire('dropbox-stream', {
        createDropboxDownloadStream
    });
    
    const token = 'token';
    const filepath = '/hello';
    
    const {createReadStream} = reRequire('../lib/dropbox');
    
    createReadStream(token, filepath);
    
    const expected = {
        token,
        filepath,
    };
    
    t.ok(createDropboxDownloadStream.calledWith(expected), 'should call createDropboxUploadStream');
    t.end();
});

test('dropbox: createReadStream: result', (t) => {
    const str = 'hello';
    const createDropboxDownloadStream = sinon
        .stub()
        .returns(stringToStream(str));
    
    mockRequire('dropbox-stream', {
        createDropboxDownloadStream
    });
    
    const token = 'token';
    const filepath = '/hello';
    
    const {createReadStream} = reRequire('../lib/dropbox');
    const stream = createReadStream(token, filepath);
    
    pullout(stream, 'string', (e, data) => {
        t.equal(data, str, 'should equal');
        t.end();
    });
});

test('dropbox: writeFile: no args', async (t) => {
    const [e] = await tryToCatch(writeFile);
    
    t.equals(e.message, 'token should be a string!', 'should throw');
    t.end();
});

test('dropbox: writeFile: no path', async (t) => {
    const [e] = await tryToCatch(writeFile, 'token', null, null);
    
    t.equal(e.message, 'path should be a string!', 'should throw');
    t.end();
});

test('dropbox: writeFile: wrong path', async (t) => {
    const error = 'Error in call to API function "files/upload"';
    
    const filesUpload = sinon
        .stub()
        .returns(Promise.reject({
            error
        }));
    
    const Dropbox = function() {
        this.filesUpload = filesUpload;
    };
    
    mockRequire('dropbox', {
        Dropbox
    });
    
    const path = 'abc';
    const contents = null;
    const {writeFile} = reRequire('..');
    
    const [e] = await tryToCatch(writeFile, 'token', path, contents);
    
    t.equal(e.message, error, 'should return error');
    t.end();
});

test('dropbox: writeFile: no contents', async (t) => {
    const promise = new Promise((resolve) => {
        return resolve('hello');
    });
    
    const filesUpload = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesUpload = filesUpload;
    };
    
    mockRequire('dropbox', {
        Dropbox
    });
    
    const path = '/abc';
    const {writeFile} = reRequire('..');
    
    const file = {
        path,
        contents: '',
        mode: {
            '.tag': 'overwrite',
        }
    };
    
    await writeFile('token', path);
    
    t.ok(filesUpload.calledWith(file), 'should call filesGetTemporaryLink');
    t.end();
});

test('dropbox: writeFile', async (t) => {
    const promise = new Promise((resolve) => {
        return resolve('hello');
    });
    
    const filesUpload = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesUpload = filesUpload;
    };
    
    mockRequire('dropbox', {
        Dropbox
    });
    
    const path = '/abc';
    const contents = 'hello world';
    const {writeFile} = reRequire('..');
    const file = {
        path,
        contents,
        mode: {
            '.tag': 'overwrite',
        }
    };
    
    await writeFile('token', path, contents);
    
    t.ok(filesUpload.calledWith(file), 'should call filesGetTemporaryLink');
    t.end();
});

test('dropbox: readFile', async (t) => {
    const promise = new Promise((resolve) => {
        return resolve('hello');
    });
    
    const filesGetTemporaryLink = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesGetTemporaryLink = filesGetTemporaryLink;
    };
    
    mockRequire('node-fetch', getFetch());
    mockRequire('dropbox', {
        Dropbox
    });
    
    const path = '/abc';
    const {readFile} = reRequire('..');
    
    await readFile('token', path)
    
    t.ok(filesGetTemporaryLink.calledWith({path}), 'should call filesGetTemporaryLink');
    t.end();
});

test('dropbox: readFile: error', async (t) => {
    const error = Error('Error in call to API function "files/get_temporary_link": request body: path: The root');
    const promise = new Promise((resolve, reject) => {
        return reject(error);
    });
    
    const filesGetTemporaryLink = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesGetTemporaryLink = filesGetTemporaryLink;
    };
    
    mockRequire('fetch', getFetch());
    mockRequire('dropbox', {
        Dropbox
    });
    
    const path = '/abc';
    const {readFile} = reRequire('..');
    
    const [e] = await tryToCatch(readFile, 'token', path);
    
    t.equal(e, error, 'should equal');
    t.end();
});

test('dropbox: copy', async (t) => {
    const from = 'a';
    const to = 'b';
    const promise = new Promise((resolve) => {
        return resolve('hello');
    });
    
    const filesCopyV2 = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesCopyV2 = filesCopyV2;
    };
    
    mockRequire('dropbox', {
        Dropbox
    });
    
    const {copy} = reRequire('..');
    const args = {
        from_path: from,
        to_path: to,
    };
    
    await copy('token', from, to);
    
    t.ok(filesCopyV2.calledWith(args), 'should call filesCopyV2');
    t.end();
});

test('dropbox: mkdir', async (t) => {
    const promise = new Promise((resolve) => {
        return resolve('hello');
    });
    
    const filesCreateFolderV2 = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesCreateFolderV2 = filesCreateFolderV2;
    };
    
    mockRequire('dropbox', {
        Dropbox
    });
    
    const path = '/hello';
    const {mkdir} = reRequire('..');
    const args = {
        path
    };
    
    await mkdir('token', path);
    
    t.ok(filesCreateFolderV2.calledWith(args), 'should call filesCreateFolderV2');
    t.end();
});

test('dropbox: mkdir: error: conflict folder', async (t) => {
    const promise = new Promise((resolve, reject) => {
        return reject({
            error: {
                error_summary: 'path/conflict/folder/...',
            }
        });
    });
    
    const filesCreateFolderV2 = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesCreateFolderV2 = filesCreateFolderV2;
    };
    
    mockRequire('dropbox', {
        Dropbox
    });
    
    const path = '/hello';
    const {mkdir} = reRequire('..');
    const args = {
        path
    };
    
    await mkdir('token', path);
    
    t.ok(filesCreateFolderV2.calledWith(args), 'should call filesCreateFolderV2');
    t.end();
});

test('dropbox: copy: no from: error', async (t) => {
    const [e] = await tryToCatch(copy, 'token', null, null);
    
    t.equal(e.message, 'from should be a string!', 'should throw');
    t.end();
});

test('dropbox: copy: no to: error', async (t) => {
    const [e] = await tryToCatch(copy, 'token', 'hello', null);
    
    t.equal(e.message, 'to should be a string!', 'should throw');
    t.end();
});

test('dropbox: move', async (t) => {
    const from = 'a';
    const to = 'b';
    const promise = new Promise((resolve) => {
        return resolve('hello');
    });
    
    const filesMoveV2 = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesMoveV2 = filesMoveV2;
    };
    
    mockRequire('dropbox', {
        Dropbox
    });
    
    const {move} = reRequire('..');
    const args = {
        from_path: from,
        to_path: to,
    };
    
    await move('token', from, to);
    
    t.ok(filesMoveV2.calledWith(args), 'should call filesMoveV2');
    t.end();
});

test('dropbox: move: error', async (t) => {
    const from = 'a';
    const to = 'b';
    const error = Error('path_loockup/not_found/..');
    const promise = new Promise((resolve, reject) => {
        return reject(error);
    });
    
    const filesMoveV2 = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesMoveV2 = filesMoveV2;
    };
    
    mockRequire('dropbox', {
        Dropbox
    });
    
    const {move} = reRequire('..');
    
    const [e] = await tryToCatch(move, 'token', from, to);
    
    t.equal(e, error, 'should equal');
    t.end();
});

test('dropbox: remove: error', async (t) => {
    const error_summary = 'path_loockup/not_found/..';
    const error = Error(error_summary);
    const promise = new Promise((resolve, reject) => {
        return reject({
            error: {
                error_summary
            }
        });
    });
    
    const filesDeleteV2 = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesDeleteV2 = filesDeleteV2;
    };
    
    mockRequire('dropbox', {
        Dropbox
    });
    
    const {remove} = reRequire('..');
    const path = 'hello';
    
    const [e] = await tryToCatch(remove, 'token', path);
    
    t.deepEqual(e, error, 'should equal');
    t.end();
});

function getFetch() {
    const body = {};
    const fetch = async () => {
        return {
            body
        };
    };
    
    return fetch;
}
