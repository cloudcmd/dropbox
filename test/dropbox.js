'use strict';

const test = require('tape');
const dropbox = require('..');
const stringToStream = require('string-to-stream');
const pullout = require('pullout');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const noop = sinon.stub();

test('dropbox: readDir: no token', (t) => {
    t.throws(dropbox.readDir, /token should be a string!/, 'should throw when no token');
    t.end();
});

test('dropbox: readDir: no path', (t) => {
    const fn = () => dropbox.readDir('', null, noop);
    
    t.throws(fn, /path should be a string!/, 'should throw when no dir');
    t.end();
});

test('dropbox: readDir: no fn', (t) => {
    const fn = () => dropbox.readDir('', '');
    
    t.throws(fn, /fn should be a function!/, 'should throw when no fn');
    t.end();
});

test('dropbox: read: dropboxify: call', (t) => {
    const path = '/';
    const dropboxify = sinon.stub();
    
    clean('..');
    stub('dropboxify', dropboxify);
    
    const dropbox = require('..');
    
    dropbox.readDir('token', path, sinon.stub());
    
    const args = [
        'token',
        '/',
        {},
    ];
    
    t.ok(dropboxify.calledWith(...args), 'should call dropboxify');
    t.end();
});

test('dropbox: read: dropboxify: call: options', (t) => {
    const path = '/';
    const dropboxify = sinon.stub();
    
    clean('..');
    stub('dropboxify', dropboxify);
    
    const dropbox = require('..');
    
    dropbox.readDir('token', path, {raw: true}, sinon.stub());
    
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
    
    clean('..');
    
    stub('dropbox-stream', {
        createDropboxUploadStream
    });
    
    const token = 'token';
    const filepath = '/hello';
    const chunkSize = 1024000;
    
    const {createWriteStream} = require('../lib/dropbox');
    
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
    
    clean('..');
    
    stub('dropbox-stream', {
        createDropboxUploadStream
    });
    
    const token = 'token';
    const filepath = '/hello';
    const chunkSize = 1024000;
    
    const {createWriteStream} = require('../lib/dropbox');
    
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
    
    clean('..');
    
    stub('dropbox-stream', {
        createDropboxDownloadStream
    });
    
    const token = 'token';
    const filepath = '/hello';
    
    const {createReadStream} = require('../lib/dropbox');
    
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
    
    clean('..');
    
    stub('dropbox-stream', {
        createDropboxDownloadStream
    });
    
    const token = 'token';
    const filepath = '/hello';
    
    const {createReadStream} = require('../lib/dropbox');
    const stream = createReadStream(token, filepath);
    
    pullout(stream, 'string', (e, data) => {
        t.equal(data, str, 'should equal');
        t.end();
    });
});

test('dropbox: writeFile: no args', (t) => {
    t.throws(dropbox.writeFile, /token should be a string!/, 'should throw');
    t.end();
});

test('dropbox: writeFile: no callback', (t) => {
    const fn = () => dropbox.writeFile('token', '/hello');
    
    t.throws(fn, /fn should be a function!/, 'should throw');
    t.end();
});

test('dropbox: writeFile: no path', (t) => {
    const fn = () => dropbox.writeFile('token', null, null, noop);
    
    t.throws(fn, /path should be a string!/, 'should throw');
    t.end();
});

test('dropbox: writeFile: wrong path', (t) => {
    const error = 'Error in call to API function "files/upload"';
    const promise = new Promise((resolve, reject) => {
        return reject({
            error
        });
    });
    
    const filesUpload = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesUpload = filesUpload;
    };
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const path = 'abc';
    const contents = null;
    const {writeFile} = require('..');
    
    writeFile('token', path, contents, (e) => {
        t.equal(e.message, error, 'should return error');
        t.end();
    });
});

test('dropbox: writeFile: no contents', (t) => {
    const promise = new Promise((resolve) => {
        return resolve('hello');
    });
    
    const filesUpload = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesUpload = filesUpload;
    };
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const path = '/abc';
    const contents = null;
    const {writeFile} = require('..');
    
    const file = {
        path,
        contents: '',
        mode: {
            '.tag': 'overwrite',
        }
    };
    
    writeFile('token', path, contents, () => {
        t.ok(filesUpload.calledWith(file), 'should call filesGetTemporaryLink');
        t.end();
    });
});

test('dropbox: writeFile', (t) => {
    const promise = new Promise((resolve) => {
        return resolve('hello');
    });
    
    const filesUpload = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesUpload = filesUpload;
    };
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const path = '/abc';
    const contents = 'hello world';
    const {writeFile} = require('..');
    const file = {
        path,
        contents,
        mode: {
            '.tag': 'overwrite',
        }
    };
    
    writeFile('token', path, contents, () => {
        t.ok(filesUpload.calledWith(file), 'should call filesGetTemporaryLink');
        t.end();
    });
});

test('dropbox: readFile', (t) => {
    const promise = new Promise((resolve) => {
        return resolve('hello');
    });
    
    const filesGetTemporaryLink = sinon
        .stub()
        .returns(promise);
    
    const Dropbox = function() {
        this.filesGetTemporaryLink = filesGetTemporaryLink;
    };
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const path = '/abc';
    const {readFile} = require('..');
    
    readFile('token', path, () => {
        t.ok(filesGetTemporaryLink.calledWith({path}), 'should call filesGetTemporaryLink');
        t.end();
    });
});

test('dropbox: readFile: error', (t) => {
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
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const path = '/abc';
    const {readFile} = require('..');
    
    readFile('token', path, (e) => {
        t.equal(e, error, 'should equal');
        t.end();
    });
});

test('dropbox: copy', (t) => {
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
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const {copy} = require('..');
    const args = {
        from_path: from,
        to_path: to,
    };
    
    copy('token', from, to, () => {
        t.ok(filesCopyV2.calledWith(args), 'should call filesCopyV2');
        t.end();
    });
});

test('dropbox: copy: no from: error', (t) => {
    const {copy} = require('..');
    const fn = () => copy('token', null, null, noop);
    
    t.throws(fn, /from should be a string!/, 'should throw');
    t.end();
});

test('dropbox: copy: no to: error', (t) => {
    const {copy} = require('..');
    const fn = () => copy('token', 'hello', null, noop);
    
    t.throws(fn, /to should be a string!/, 'should throw');
    t.end();
});

test('dropbox: move', (t) => {
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
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const {move} = require('..');
    const args = {
        from_path: from,
        to_path: to,
    };
    
    move('token', from, to, () => {
        t.ok(filesMoveV2.calledWith(args), 'should call filesMoveV2');
        t.end();
    });
});

test('dropbox: move: error', (t) => {
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
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const {move} = require('..');
    
    move('token', from, to, (e) => {
        t.equal(e, error, 'should equal');
        t.end();
    });
});

test('dropbox: delete: error', (t) => {
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
    
    clean('..');
    
    stub('dropbox', {
        Dropbox
    });
    
    const dropbox = require('..');
    const path = 'hello';
    
    dropbox.delete('token', path, (e) => {
        t.deepEqual(e, error, 'should equal');
        t.end();
    });
});

function clean(path) {
    delete require.cache[require.resolve(path)];
}

function stub(name, fn) {
    require.cache[require.resolve(name)].exports = fn;
}

