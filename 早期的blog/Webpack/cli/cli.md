# cli.js

cli代码整体用一个IIFE进行包裹。由于萌新第一次分析源码，还不太清楚如何分块，先一部分一部分来分析，暂无标题。

## Part One

``` js
(function() {
    // wrap in IIFE to be able to use return

	const importLocal = require("import-local"); // https://www.npmjs.com/package/import-local
	// Prefer the local installation of webpack-cli
	if (importLocal(__filename)) { // __filename: 获得当前执行文件的带有完整绝对路径的文件名
		return;
    }
    ....
})()
```

首先这里其实一段很简单的代码，但是有很多模块是我们不知道的。我们先来看看都有什么：

* `import-local`模块
* `__filename`

我们首先看一下比较简单的 `__filename` 是什么？

### __filename

首先给一下官方的解释：

> 这个变量看起来像是一个全局变量，其实并不是。
> `__filename` 是当前模块的文件名称。是已经解析过的当前模块文件的绝对路径。假如说有两个模块 `a` 和 `b`，`a` 依赖 `b`，目录结构大致为：`/Users/mjr/app/a.js` 和 `/Users/mjr/app/node_modules/b/b.js`，那么对于 `b` 中的 `__filename` 将返回 `/Users/mjr/app/node_modules/b/b.js` 而 `a` 中将返回 `/Users/mjr/app/a.js`。

关于官方的解释：

1. 为什么不是全局变量？其实 `__filename` 是Node.js的模块系统（modules system）的一部分。在Node.js模块系统中，每个文件都被视为一个单独的模块。而 `__filename`、`__dirname`、`exports`、`module`、`require` 都是模块范围的一部分。

2. 第二点，其实我知道了 `__filename` 的作用就是获取当前文件的已解析的绝对路径。

好了，我们已经解决了关于 `__filename` 的疑惑，接下来我们看一下关于 `import-local` 模块是做什么的？

### import-local

通过npm官网，我们找到了[import-local](https://www.npmjs.com/package/import-local)，虽然大概通过介绍知道了它是做的什么，但是还是有些不是十分理解。所以我们来看一下它的源码。

**import-local/index.js**

``` js
'use strict';
const path = require('path');
const resolveCwd = require('resolve-cwd');
const pkgDir = require('pkg-dir');

module.exports = filename => {
	const globalDir = pkgDir.sync(path.dirname(filename));
	const relativePath = path.relative(globalDir, filename);
	const pkg = require(path.join(globalDir, 'package.json'));
	const localFile = resolveCwd.silent(path.join(pkg.name, relativePath));

	// Use `path.relative()` to detect local package installation,
	// because __filename's case is inconsistent on Windows
	// Can use `===` when targeting Node.js 8
	// See https://github.com/nodejs/node/issues/6624
	return localFile && path.relative(localFile, filename) !== '' ? require(localFile) : null;
};
```

关于源码，代码还算简单，所以我们可以很快的看一下大概做了什么。首先解决其中我们不知道的东西：

* `resolve-cwd`模块
* `pkg-dir`模块
* `path.relative` 
* `path.dirname`
* `path.join`

我们首先看一下比较简单的几个。

### path.relative && path.dirname && path.join

> `path` 是Node.js的一个用于处理文件与目录的路径的模块。可以通过如下方式使用：

``` js
const path = require('path');
```

> path 模块的默认操作会根据 Node.js 应用程序运行的操作系统的不同而变化。 比如，当运行在 Windows 操作系统上时，path 模块会认为使用的是 Windows 风格的路径。

看完了关于path的官方介绍，接下来看一下这些函数。

#### path.join([...paths])

> ...paths `<string>` 一个路径片段的序列，返回: `<string>`。
> `path.join()` 方法使用平台特定的分隔符把全部给定的 `path` 片段连接到一起，并规范化生成的路径。长度为零的 `path` 片段会被忽略。 如果连接后的路径字符串是一个长度为零的字符串，则返回 '.'，表示当前工作目录。如果任一路径片段不是一个字符串，则抛出 `TypeError`。

#### path.dirname(path)

> path `<string>`，返回 `<string>`。
> `path.dirname()` 方法返回一个 `path` 的目录名，类似于 Unix 中的 dirname 命令。尾随后面的目录分隔符是会被忽略的。`Windows`上是 `\`，`POSIX` 是 `/`。

#### path.relative(from, to)

> from `<string>`，to `<string>`，返回 `<string>`。
> path.relative() 方法返回从 from 到 to 的相对路径（基于当前工作目录）。 如果 from 和 to 各自解析到同一路径（调用 path.resolve()），则返回一个长度为零的字符串。
> 如果 `from` 或 `to` 传入了一个长度为零的字符串，则当前工作目录会被用于代替长度为零的字符串。
> 例如，在 POSIX 上：
> ``` js
> path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')
> // 返回: '../../impl/bbb'
> ```
> 在 Windows 上：
> ``` js
> path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb');
> // 返回: '..\\..\\impl\\bbb' 
> ```
> 如果 from 或 to 不是一个字符串，则抛出 TypeError。

其实通过官方的解释，基本能理解关于 `path.relative` 的功能。说白了，其实就是通过 `path.relative` 得到如何从 `from` 目录到 `to` 这个目录的*路径字符串*。

接下来，我们看一下剩下的两个模块。

### [resolve-cwd](https://www.npmjs.com/package/resolve-cwd)

该模块的作用是像 `require.resolve` 一样解析模块的路径，只不过是从当前的工作目录解析。不过我其实也不清楚 `require.resolve` 模块的作用，所以去查了一下官方的文档：

> 使用内部的 `require()` 机制来查找模块的位置，而不是加载模块，只需返回已解析的文件名。

`require.resolve`方法接收一个 `request`字符串，相当于要解析的模块路径。还接收一个可选参数 `options`。返回一个字符串。

这样我们就知道了关于 `resolve-cwd` 的作用。只不过它与 `require.resolve` 的区别是是否基于当前工作目录开始解析。`resolveCwd`只接收一个 `moduleId`，类型字符串，当直接使用的时候（`resolveCwd(moduleId)`）类似 `require()`，当模块未找到的时候，抛出异常。我们还可以通过 `resolveCwd.silent(moduleId)` 使用，当模块不存在的时候，返回 `null`。

### [pkg-dir](https://github.com/sindresorhus/pkg-dir)

`pkg-dir`的作用是获取 Node.js 项目或者 npm 的 `package.json`文件所在的根目录。

例如：

**目录结构**

```
/
└── Users
    └── sindresorhus
        └── foo
            ├── package.json
            └── bar
                ├── baz
                └── example.js
```

``` js
const pkgDir = require('pkg-dir');

(async () => {
    const rootDir = await pkgDir(__dirname);

    console.log(rootDir);
    //=> '/Users/sindresorhus/foo'
})();
```

直接调用 `pkgDir([cwd])` 会返回一个带有项目根目录的 `Promise`，如果找不到，返回 `null`。同时它还有一个同步方法 `pkgDir.sync([cwd])`，返回项目根目录或者 `null`。

### 分析代码

