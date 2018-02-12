# Dropbox [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]:                https://img.shields.io/npm/v/@cloudcmd/dropbox.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/cloudcmd/dropbox/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/cloudcmd/dropbox.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/@cloudcmd/dropbox "npm"
[BuildStatusURL]:           https://travis-ci.org/cloudcmd/dropbox  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/cloudcmd/dropbox "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

[CoverageURL]:              https://coveralls.io/github/cloudcmd/dropbox?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/cloudcmd/dropbox/badge.svg?branch=master&service=github

Dropbox files and folders CRUD.

## Install

```
npm i @cloudcmd/dropbox --save
```

## API

All functions requires [accessToken](https://blogs.dropbox.com/developers/2014/05/generate-an-access-token-for-your-own-account/) as first parameter

### readDir(accessToken, path[, options], fn)

- **accessToken** - `string`
- **path** - `string`
- **options** - `object` can contain:
  - `sort` - sort by: name, size, date
  - `order` - "asc" or "desc" for ascending and descending order (default: "asc")
  - `type` - when "raw" returns not formatted result
- **fn** - `function` callback

#### Example

```js
const sort = 'size';
const order = 'desc';
const token = 'token';
const path = '/';
const type = 'raw';

const {readDir} = require('@cloudcmd/dropbox');

readDir(accessToken, path, {type, sort, order}, (e, files) => {
    console.log(files);
    // outputs
    {
        path: "/",
        files: [{
            name: 'dropbox.js',
            size: 4735,
            date: 1377248899000,
            owner: 0,
            mode: 0
        }, {
            name: 'readify.js',
            size: 3735,
            date: 1377248899000,
            owner: 0,
            mode: 0
        }];
    }
});
```

### readFile(accessToken, path, fn)

- **accessToken** - `token`
- **path** - path to file
- **fn** - `function` callback

#### Example

```js
const {readFile} = require('@cloudcmd/dropbox');

readFile(accessToken, '/dropbox.html', (e, readStream) => {
    if (e)
        return console.error(e);
    
    readStream.pipe(process.stdout);
});
```

### read(accessToken, path[, options], fn)

Read file/directory.

- **accessToken** - `token`
- **options** - same options as `readDir` takes in
- **path** - path to file
- **fn** - `function` callback

#### Example

```js
const {read} = require('@cloudcmd/dropbox');

read(accessToken, '/fileOrDir', (e, readStream) => {
    if (e)
        return console.error(e);
    
    readStream.pipe(process.stdout);
});
```

### delete(accessToken, path, fn)

delete file/directory.

- **accessToken** - `token`
- **path** - path to file
- **fn** - `function` callback

#### Example

```js
const dropbox = require('@cloudcmd/dropbox');

dropbox.delete(accessToken, '/fileOrDir', console.log);
```

### move(accessToken, from, to, fn)

Move file/directory to new location

- **accessToken** - `token`
- **path** - path to file
- **fn** - `function` callback

#### Example

```js
const dropbox = require('@cloudcmd/dropbox');

dropbox.move(accessToken, '/fileOrDir', console.log);
```

## Environments

In old `node.js` environments that not supports `es2017`, `dropbox` can be used with:

```js
var dropbox = require('@cloudcmd/dropbox/legacy');
```

## Related

- [readify](https://github.com/coderaiser/readify "readify") - read directory content with file attributes: size, date, owner, mode
- [flop](https://github.com/coderaiser/flop "flop") - FoLder OPerations
- [dropboxify](https://github.com/coderaiser/dropboxify "dropboxify") - read directory content from dropbox compatible way with `readify`

## License

MIT

