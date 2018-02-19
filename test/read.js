'use strict';

const test = require('tape');
const currify = require('currify');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const read = require('../lib/read');
const {promisify} = require('es6-promisify');
const squad = require('squad');
const stub = require('mock-require');
const clean = require('clear-module');

const swap = currify((fn, a, b) => fn(b, a));
const swapPromisify = squad(swap, promisify, require);
const pullout_ = swapPromisify('pullout');

const stringify = (json) => JSON.stringify(json, null, 4);

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
    
    const createReadStream = sinon.stub();
    
    clean('../lib/read');
    stub('..', {
        readDir,
        createReadStream,
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
    
    const createReadStream = sinon.stub();
    
    clean('../lib/read');
    stub('..', {
        readDir,
        createReadStream,
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
    
    const readDir = (token, path, options, fn) => {
        fn(Error('path/not_folder/'));
    };
    
    const result = {};
    const createReadStream = sinon
        .stub()
        .returns(result);
    
    clean('../lib/read');
    stub('..', {
        readDir,
        createReadStream,
    });
    
    const read = require('../lib/read');
    
    read(token, path, (e, data) => {
        t.equal(data, result, 'should equal');
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
    
    const createReadStream = sinon.stub();
    
    clean('../lib/read');
    stub('..', {
        readDir,
        createReadStream,
    });
    
    const read = promisify(require('../lib/read'));
    const check = (result) => {
        t.equal(result, stringify(list), 'should equal');
        t.end();
    };
    
    const fail = (e) => {
        t.fail(e.message);
        t.end();
    };
    
    read(token, path)
        .then(pullout_('string'))
        .then(check)
        .catch(fail);
});

