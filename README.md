# Dropbox [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]:                https://img.shields.io/npm/v/@cloudcmd/dropbox.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/cloudcmd/dropbox/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/david/cloudcmd/dropbox.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/@cloudcmd/dropbox "npm"
[BuildStatusURL]:           https://travis-ci.org/cloudcmd/dropbox  "Build Status"
[DependencyStatusURL]:      https://david-dm.org/cloudcmd/dropbox "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

[CoverageURL]:              https://coveralls.io/github/cloudcmd/dropbox?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/cloudcmd/dropbox/badge.svg?branch=master&service=github

Dropbox files and folders CRUD.

## Install

```
npm i @cloudcmd/dropbox --save
```

## API

All functions requires [token](https://blogs.dropbox.com/developers/2014/05/generate-an-access-token-for-your-own-account/) as first parameter

### readDir(token, path[, options], fn)

- **token** - `string`
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

readDir(token, path, {type, sort, order}, (e, files) => {
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

### readFile(token, path, fn)

- **token** - `token`
- **path** - path to file
- **fn** - `function` callback

#### Example

```js
const {readFile} = require('@cloudcmd/dropbox');

readFile(token, '/dropbox.html', (e, readStream) => {
    if (e)
        return console.error(e);
    
    readStream.pipe(process.stdout);
});
```

### writeFile(token, path, contents, fn)

- **token** - `token`
- **path** - path to file
- **contents** - contents of a file
- **fn** - `function` callback

#### Example

```js
const {writeFile} = require('@cloudcmd/dropbox');

writeFile(token, '/hello.txt', 'hello', console.error);
```

### createWriteStream(token, path)

- **token** - `token`
- **path** - path to file

#### Example

```js
const {createReadStream}  = require('fs');
const {createWriteStream} = require('@cloudcmd/dropbox');

const token = 'token';
const path = '/file';

const dropboxStream = createWriteStream(token, path);
const localStream = fs.createReadStream(path);

localStream
    .pipe(dropboxStream)
    .on('error', console.error)
    .on('finish', console.log)
```

### createReadStream(token, path)

- **token** - `token`
- **path** - path to file

#### Example

```js
const {createWriteStream} = require('fs');
const {createReadStream}  = require('@cloudcmd/dropbox');

const token = 'token';
const path = '/file';

const dropboxStream = fs.createReadStream(path);
const localStream = createWriteStream(token, path);

dropboxStream
    .pipe(localStream)
    .on('error', console.error)
    .on('finish', console.log)
```

### remove(token, path, fn)

remove file/directory.

- **token** - `token`
- **path** - path to file
- **fn** - `function` callback

#### Example

```js
const {remove} = require('@cloudcmd/dropbox');

remove(token, '/fileOrDir', console.log);
```

### mkdir(token, from, to, fn)

create directory.

- **token** - `token`
- **path** - `string`
- **fn** - `function` callback

#### Example

```js
const {mkdir} = require('@cloudcmd/dropbox');

mkdir(token, '/dirname', console.log);
```

### copy(token, from, to, fn)

Copy file/directory to new location

- **token** - `token`
- **from** - path `from`
- **to** - path `to`
- **fn** - `function` callback

#### Example

```js
const {copy} = require('@cloudcmd/dropbox');

copy(token, '/file1', '/file2', console.log);
```

### move(token, from, to, fn)

Move file/directory to new location

- **token** - `token`
- **from** - path `from`
- **to** - path `to`
- **fn** - `function` callback

#### Example

```js
const {move} = require('@cloudcmd/dropbox');

move(token, '/file1', '/file2', console.log);
```

## Related

- [readify](https://github.com/coderaiser/readify "readify") - read directory content with file attributes: size, date, owner, mode
- [flop](https://github.com/coderaiser/flop "flop") - FoLder OPerations
- [dropboxify](https://github.com/coderaiser/dropboxify "dropboxify") - read directory content from dropbox compatible way with `readify`

## License

MIT

