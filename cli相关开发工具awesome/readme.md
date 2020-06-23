# awesome

## [signale](https://github.com/klaussinani/signale)

Highly configurable logging utility

高度可配置的日志记录实用程序

## [cosmiconfig](https://github.com/davidtheclark/cosmiconfig)

Find and load configuration from a package.json property, rc file, or CommonJS module

从package.json属性，rc文件或CommonJS模块中查找并加载配置。

## [ajv](https://ajv.js.org/)

json schema 校验器

``` js
const Ajv = require('ajv');
const ajv = new Ajv({$data: true, jsonPointers: true}); // options can be passed, e.g. {allErrors: true}
const schema = {
    properties: {
        name: {
            type: 'string',
            maxLength: 10
        },
        age: {
            type: 'number',
            minimum: 0
        }
    }
};
const data = {
    name: 'hello world',
    age: -1
};
var validate = ajv.compile(schema);
var valid = validate(data);
console.log(valid);
if (!valid) console.log(validate.errors);
```

相关的包：[ajv-keywords](https://www.npmjs.com/package/ajv-keywords#usage)(增强ajv，增加自定义关键词，例如`if`)

## [chokidar](https://github.com/paulmillr/chokidar)

An efficient wrapper around node.js fs.watch / fs.watchFile / FSEvents

围绕node.js的高效包装fs.watch / fs.watchFile / FSEvents

``` js
const chokidar = require('chokidar');
const fs = require('fs');

const cachedStats = {};

const prepareCachedStats = files => {
    for (const file of files) {
        if (fs.existsSync(file)) {
            const stat = fs.statSync(file);
            if (stat.isFile() && !cachedStats[file]) {
                // cachedStats[file] = stat.size;
                console.log(file, stat.size);
            }
        }
    }
};

const getWatchedFiles = watcher => {
    const watched = watcher.getWatched();
    console.log('watched', watched);
    const files = [];
    Object.keys(watched).forEach(dir => {
        watched[dir].forEach(fileName => {
            // console.log('fileName', fileName);
            files.push(`${dir}/${fileName}`);
        });
    });
    console.log(files);
    return files;
};

// One-liner for current directory
const watcher = chokidar.watch('./src').on('all', (event, path) => {
  console.log(event, path);
});

watcher.on('change', changed => {
    const { size } = fs.statSync(changed);
    console.log('change', size);

    prepareCachedStats(getWatchedFiles(watcher));

    if (cachedStats[changed] && size !== cachedStats[changed]) {
      cachedStats[changed] = size;
      hooks.emit('files-change', changed);
    }
});

watcher.on('add', filePath => {
    console.log('watch add', filePath);
});
```

## [nodemon]()

## [commander]()

## [fs-extra](https://github.com/jprichardson/node-fs-extra/)

node fs的更加贴近实际应用的操作。

Node.js: extra methods for the fs object like copy(), remove(), mkdirs()
