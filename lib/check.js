'use strict';

module.exports.checkToken = (token) => {
    if (typeof token !== 'string')
        throw Error('token should be a string!');
}

module.exports.checkFn = (fn) => {
    if (typeof fn !== 'function')
        throw Error('fn should be a function!');
}

module.exports.checkFrom = (from) => {
    if (typeof from !== 'string')
        throw Error('from should be a string!');
}

module.exports.checkTo = (to) => {
    if (typeof to !== 'string')
        throw Error('to should be a string!');
}

module.exports.checkPath = (path) => {
    if (typeof path !== 'string')
        throw Error('path should be a string!');
}

