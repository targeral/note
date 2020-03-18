# webpack-cli

首先看一下关于 `webpack-cli`的可执行文件的bin目录下有哪些文件：

* cli.js
* config-yargs.js
* convert-argv.js
* errorHelpers.js
* optionsSchema.json
* prepareOptions.js
* prompt-command.js
* webpackConfigurationSchema.json

而我们通过看项目的 `package.json` 文件可以知道，`webpack-cli` 的是通过 `cli.js` 开始执行的。

**package.json**

``` json
{
    "name": "webpack-cli",
    "version": "3.1.0",
    "description": "CLI for webpack & friends",
    "license": "MIT",
    "repository": {
        "type": "git",
        "url": "https://github.com/webpack/webpack-cli.git"
    },
    "bin": {
        "webpack-cli": "./bin/cli.js"
    },
    ....
}
```

所以我们首先看一下关于 `cli.js` 的源码。