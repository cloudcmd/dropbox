'use strict';

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const {Readable} = require('stream');
const read = require('../lib/read');

test('dropbox: no args', (t) => {
    t.throws(read, /token should be a string!/, 'should throw when no token');
    t.end();
});

test('dropbox: no path', (t) => {
    const fn = () => read('token');
    
    t.throws(fn, /path should be a string!/, 'should throw when no path');
    t.end();
});

test('dropbox: no fn', (t) => {
    const fn = () => read('token', '/hello');
    
    t.throws(fn, /fn should be a function!/, 'should throw when no path');
    t.end();
});

test('dropbox: read: error', (t) => {
    const token = 'token';
    const path = '/';
    const error = Error('hello');
    
    const readDir = (token, path, options, fn) => {
        fn(error);
    };
    
    const readFile = sinon.stub();
    
    clean('../lib/read');
    stub('..', {
        readDir,
        readFile,
    });
    
    const read = require('../lib/read');
    
    read(token, path, (e) => {
        t.equal(e, error, 'should return error');
        t.end();
    });
});

test('dropbox: read: options: error', (t) => {
    const token = 'token';
    const path = '/';
    const error = Error('hello');
    const options = {};
    
    const readDir = (token, path, options, fn) => {
        fn(error);
    };
    
    const readFile = sinon.stub();
    
    clean('../lib/read');
    stub('..', {
        readDir,
        readFile,
    });
    
    const read = require('../lib/read');
    
    read(token, path, options, (e) => {
        t.equal(e, error, 'should return error');
        t.end();
    });
});

test('dropbox: read: not dir', (t) => {
    const token = 'token';
    const path = '/';
    const error = Error('file error');
    
    const readDir = (token, path, options, fn) => {
        fn(Error('path/not_folder/'));
    };
    
    const readFile = (token, path, fn) => {
        fn(error);
    };
    
    clean('../lib/read');
    stub('..', {
        readDir,
        readFile,
    });
    
    const read = require('../lib/read');
    
    read(token, path, (e) => {
        t.equal(e, error, 'should return file error');
        t.end();
    });
});

test('dropbox: read: result', (t) => {
    const token = 'token';
    const path = '/';
    const list = {
        hello: 'world'
    };
    
    const readDir = (token, path, options, fn) => {
        fn(null, list);
    };
    
    const readFile = sinon.stub();
    
    clean('../lib/read');
    stub('..', {
        readDir,
        readFile,
    });
    
    const read = require('../lib/read');
    
    read(token, path, (e, stream) => {
        t.ok(stream instanceof Readable, 'should return stream');
        t.end();
    });
});

function clean(path) {
    delete require.cache[require.resolve(path)];
}

function stub(name, fn) {
    require.cache[require.resolve(name)].exports = fn;
}

