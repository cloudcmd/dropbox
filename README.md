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

### readDir(token, path[, options])

- **token** - `string`
- **path** - `string`
- **options** - `object` can contain:
  - `sort` - sort by: name, size, date
  - `order` - "asc" or "desc" for ascending and descending order (default: "asc")
  - `type` - when "raw" returns not formatted result

#### Example

```js
const sort = 'size';
const order = 'desc';
const token = 'token';
const path = '/';
const type = 'raw';

const {readDir} = require('@cloudcmd/dropbox');

const files = await readDir(token, path, {type, sort, order});
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
```

### readFile(token, path)

- **token** - `token`
- **path** - path to file

#### Example

```js
const {readFile} = require('@cloudcmd/dropbox');

const readStream = await readFile(token, '/dropbox.html');
readStream.pipe(process.stdout);
```

### writeFile(token, path, contents)

- **token** - `token`
- **path** - path to file
- **contents** - contents of a file

#### Example

```js
const {writeFile} = require('@cloudcmd/dropbox');

await writeFile(token, '/hello.txt', 'hello');
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

### remove(token, path)

remove file/directory.

- **token** - `token`
- **path** - path to file

#### Example

```js
const {remove} = require('@cloudcmd/dropbox');

await remove(token, '/fileOrDir');
```

### mkdir(token, path)

create directory.

- **token** - `token`
- **path** - `string`

#### Example

```js
const {mkdir} = require('@cloudcmd/dropbox');

await mkdir(token, '/dirname');
```

### copy(token, from, to)

Copy file/directory to new location

- **token** - `token`
- **from** - path `from`
- **to** - path `to`

#### Example

```js
const {copy} = require('@cloudcmd/dropbox');

await copy(token, '/file1', '/file2');
```

### move(token, from, to)

Move file/directory to new location

- **token** - `token`
- **from** - path `from`
- **to** - path `to`

#### Example

```js
const {move} = require('@cloudcmd/dropbox');

await move(token, '/file1', '/file2');
```

## Related

- [readify](https://github.com/coderaiser/readify "readify") - read directory content with file attributes: size, date, owner, mode
- [flop](https://github.com/coderaiser/flop "flop") - FoLder OPerations
- [dropboxify](https://github.com/coderaiser/dropboxify "dropboxify") - read directory content from dropbox compatible way with `readify`

## License

MIT

