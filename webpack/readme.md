#webpack

一些术语：

* Chunk: 这是 webpack 特定的术语被用在内部来管理 building 过程。bundle 由 chunk 组成，其中有几种类型（例如，入口 chunk(entry chunk) 和子 chunk(child chunk)）。通常 chunk 会直接对应所输出的 bundle，但是有一些配置并不会产生一对一的关系。
* Code Split：指将代码分离到每个 bundles/chunks 里面，你可以按需加载，而不是加载一个包含全部的 bundle。
* Bundle：由多个不同的模块生成，bundles 包含了早已经过加载和编译的最终源文件版本。
* Bundle Split：这个流程提供一个优化 build 的方法，允许 webpack 为应用程序生成多个 bundle。最终效果是，当其他某些 bundle 的改动时，彼此独立的另一些 bundle 都可以不受到影响，减少需要重新发布的代码量，因此由客户端重新下载并利用浏览器缓存。
* Dependency Graph：有时候一个文件依赖于其他文件，webpack 将其视为依赖关系(dependency)。从一个或多个入口点开始，webpack 递归构建一个依赖关系图，里面包含了你的应用程序需要的所有模块/资源(mudule/asset)。
* 提供比完整程序接触面(surface area)更小的离散功能块。精心编写的模块提供了可靠的抽象和封装界限，使得应用程序中每个模块都具有条理清楚的设计和明确的目的。

[更多](https://webpack.docschina.org/glossary#f)

## loader

https://www.jianshu.com/p/01e3f0a00e4e

## configuration

### optimization

#### optimization.minimize

`boolean`

告诉webpack使用[TerserPlugin](https://webpack.js.org/plugins/terser-webpack-plugin/)去压缩bundle。

默认在生产模式下（mode为`production`）为`true`。

**webpack.config.js**

```js
module.exports = {
    //...
    optimization: {
        minimize: false
    }
};
```

#### optimization.minimizer

`[<plugin>]` | `[function (compiler)]`

允许使用一个或者多个不同的`TerserPlugin`实例来重写默认的压缩器

**webpack.config.js**

``` js
const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
    optimization: {
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true // Must be set to true if using source-map in production
                terserOptions: {
                    //https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                },
            }),
        ],
    },
};
```

或者使用函数的形式：

``` js
module.exports = {
  optimization: {
    minimizer: [
      (compiler) => {
        const TerserPlugin = require('terser-webpack-plugin');
        new TerserPlugin({ /* your config */ }).apply(compiler);
      }
    ],
  }
};
```

#### optimization.splitChunks

`object`

可用的配置选项和SplitChunksPlugin插件相同。

默认模式只影响按需(on-demand)加载的代码块(chunk)，因为改变初始代码块会影响声明在HTML的script标签。如果可以处理好这些（比如，从打包状态里面读取并动态生成script标签到HTML），你可以通过设置optimization.splitChunks.chunks: "all"，应用这些优化模式到初始代码块(initial chunk)。

webpack会根据一下条件来拆分chunks：

* 新代码块可以被共享引用或者来自`node_modules`文件夹下的模块
* 新代码块大于30kb（min+gziped之前的体积）
* 根据需要加载chunks时的最大并行请求数应该小于或等于5
* 初始页面加载时的最大并行请求数应该小于或等于3

为了满足后面两个条件，webpack有可能受限于包的最大数量值，由此导致生成的代码体积往上增加。

splitChunks选项整体的配置如下：

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

##### splitChunks.automaticNameDelimiter

`string`

默认情况下，webpack将使用块的名称和名称生成名称（例如vendors~main.js）。??
此选项允许您指定用于生成的名称的分隔符。

##### splitChunks.chunks

`function (chunk) | string`

这个选项用来说明哪些chunks被优化（被抽取处理）。当提供一个字符串的时候，可以用的值为

* `all`
* `async`
* `initial`

当值为 `initial` 的时候，webpack将对非动态加载模块进行优化，而对于每一个动态加载模块都分别创建文件。
当值为 `async` 的时候，webpack将对动态加载模块进行优化，而对于每一个非动态加载模块不做任何处理，放在原处。
当值为 `all` 的时候，webpack将对动态和非动态模块同时进行优化。

以上可参考：https://medium.com/dailyjs/webpack-4-splitchunks-plugin-d9fbbe091fd0

**webpack.config.js**

``` js
module.exports = {
    splitChunks: {
        // include all types of chunk
        chunks: 'all',
    },
};
```

或者，您可以提供更多控制功能。返回值将指示是否包括每个块。

``` js
module.exports = {
  // ..
  optimization: {
    splitChunks: {
      chunks (chunk) {
        // 创建一个不包含 `my-excluded-chunk`的chunk
        return chunk.name !== 'my-excluded-chunk';
      }
    }
  }
}
```

##### splitChunks.maxAsyncRequests

`number`

按需加载时的最大并行请求数。默认为5。

##### splitChunks.maxInitialRequests

`number`

一个入口的最大并行请求数。默认为3。

##### splitChunks.minChunks

`number`

在被代码分割前的，满足的模块引用最小次数。（即当模块的被引用次数超过minChunks时，将被优化）

##### splitChunks.minSize

`number`

要生成的块的最小大小（以字节为单位）。

##### splitChunks.maxSize

`number`

对于chunk大小大于 `maxSize` 进行优化，大小至少为 `minSize`。

maxSize选项旨在与HTTP2和长期缓存一起使用。它增加了请求数以获得更好的缓存。它还可用于减小文件大小以加快重建速度。

*maxSize 比 maxInitialRequest / maxAsyncRequests具有更高的优先级。实际优先级为maxInitialRequest / maxAsyncRequests < maxSize < minSize。*

##### splitChunks.name

`boolean: true | function (module, chunks, cacheGroupKey) | string`

拆分块的名称。提供true将自动生成基于块和 `cacheGroup` 键值的名称。提供字符串或函数将允许您使用自定义名称。如果名称与入口模块名称匹配，则将删除入口模块。

*对于生产环境构建，建议将splitChunks.name设置为false，以便它不会不必要地更改名称。*

**webpack.config.js**

``` js
module.exports = {
  optimization: {
    splitChunks: {
      name (module, chunks, cacheGroupKey) {
        // generate a chunk name ...
        return; // ...
      }
    }
  }
}
```

*注意：当为不同的 chunks 分配相同的名称时，它们将被合并。这个特性可以用来将被不同入口点/分割点引用的所有 vendor 模块合并到同一个 chunk，但我并不建议这样做。因为这可能导致不必要的代码被下载。*

##### splitChunks.cacheGroups

cacheGroups会继承或者重写任何来自 `splitChunks.*`的配置，但是`test`，`priority` 和 `reuseExistingChunk` 只能在cacheGroup层级里配置。要禁用默认cacheGroup的任何配置，请将它们设置为false。

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      cacheGroup: {
        default: false
      }
    }
  }
}
```

###### splitChunks.cacheGroups.priority

`number`

一个模块可能会match很多种 `cacheGroup`。使用那种优化方案将通过 `priority`来决定。默认cacheGroup的优先级为负值，以允许自定义的cacheGroup获得更高的优先级（自定义cacheGroup的默认值为0）。

###### splitChunks.cacheGroups.{cacheGroup}.reuseExistingChunk

`boolean`

reuseExistingChunk选项用于配置在模块完全匹配时重用已有的块，而不是创建新块。

*reuseExistingChunk tells SplitChunksPlugin to use existing chunk if available instead of creating new one. For example, if any module imported inside common chunk code is part of another chunk already, then instead of creating new chunk for it, older one is reused instead.*

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

###### splitChunks.cacheGroups.{cacheGroup}.test

`function (module, chunk) | ReExp | string`

该cacheGroup所匹配的模块。省略它则选择所有模块。它可以匹配绝对模块资源路径或块名称。匹配块名称时，将选择块中的所有模块。

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test(module, chunks) {
            //...
            return module.type === 'javascript/auto';
          }
        }
      }
    }
  }
}
```

###### splitChunks.cacheGroups.{cacheGroup}.filename

`string`

允许在当且仅当它是初始块时覆盖文件名。`output.filename` 中提供的所有占位符也可在此处使用。


*此选项也可以在splitChunks.filename中全局设置，但不建议这样做，如果splitChunks.chunks未设置为“initial”，则可能会导致错误。避免全局设置。*

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          filename: '[name].bundle.js'
        }
      }
    }
  }
};
```

###### splitChunks.cacheGroups.{cacheGroup}.enforce

`boolean: false`

告诉 `webpack` 忽略 `splitChunks.minSize`，`splitChunks.minChunks`，`splitChunks.maxAsyncRequests` 和 `splitChunks.maxInitialRequests` 选项，并始终为此cacheGroup创建chunk。

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          enforce: true
        }
      }
    }
  }
};
```

#### optimization.runtimeChunk

`object` `string` `boolean`

将 `optimization.runtimeChunk` 设置为 `true` 或 `multiple` 会为每个仅包含运行时的入口点添加一个额外的 `chunk`。

**webpack.config.js**

``` js
module.exports = {
  optimization: {
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`
    }
  }
}
```

值“single”改为创建要为所有生成的块共享的运行时文件。此设置是以下别名：

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    runtimeChunk: {
      name: 'runtime'
    }
  }
};
```

通过将 `optimization.runtimeChunk` 设置为 `object`，只能提供 `name` 属性，该属性代表运行时块的名称或名称工厂。

针对单入口可以采用single模式，即：

``` js
module.exports = {
  optimization: {
    runtimeChunk: 'runtime'
  }
}
```

针对多一个入口可以采用multiple模式，即：

``` js
module.exports = {
  optimization: {
    runtimeChunk: entryPoint => `runtime.${entryPoint}`
  }
}
```

**runtimeChunk干了什么？**

https://imweb.io/topic/5a4cce35a192c3b460fce39b

首先它实现了 `__webpack_require__` 这样一个函数，`runtime.js`文件里注释是 *The require function*。作用和 Node.js 中 require 语句相似，就是为了实现模块的加载功能。

``` js
function __webpack_require__(moduleId) {

		// Check if module is in cache
	if(installedModules[moduleId]) {
		return installedModules[moduleId].exports;
	}
	// Create a new module (and put it into the cache)
	var module = installedModules[moduleId] = {
		i: moduleId,
		l: false,
		exports: {}
	};

		// Execute the module function
	modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

		// Flag the module as loaded
	module.l = true;

		// Return the exports of the module
	return module.exports;
}
```

它主要做的是根据 `moduleId`，判断缓存了 `Module`对象（随暂时起的名字）的对象 `installedModules` 中是否存在此Id，如果存在则直接取数组中的函数（也就是从内存中取出）；如果没有此Id，则创建一个如下结构的对象，也就是上面说的Module对象：

``` js
{
  i: moduleId,  // 模块在数组中的 index
  l: false, // 该模块是否已经加载完毕
  exports: {}  // 该模块的导出值
}
```

然后从 `modules` 中获取 index 为 moduleId 的模块对应的函数，再调用这个函数，同时把函数需要的参数传入。最后把此模块标记为已加载并返回这个模块的值。

*`modules` 即为存放所有模块的数组，数组中的每一个元素都是一个函数）*

然后 `runtime.js` 实现了 `webpackJsonpCallback`，并用此函数重写了 `window['webpackJsonp']` 的 `push` 方法。所以在像是 `vendor.js` 或者 `main.js` 里会看见这样的代码：

``` js
(window["webpackJsonp"] = window["webpackJsonp"] || []).push（[0], [
   (function(module, exports, __webpack_require__){
     //....
   }),
   (function(module, exports, __webpack_require__){
     //....
   }),
   ....
])
```

而 `webpackJsonpCallback` 做的事情是：

``` js
function webpackJsonpCallback(data) {
	var chunkIds = data[0];
	var moreModules = data[1];
	var executeModules = data[2];
	// add "moreModules" to the modules object,
	// then flag all "chunkIds" as loaded and fire callback
	var moduleId, chunkId, i = 0, resolves = [];
	for(;i < chunkIds.length; i++) {
		chunkId = chunkIds[i];
		if(installedChunks[chunkId]) {
			resolves.push(installedChunks[chunkId][0]);
		}
		installedChunks[chunkId] = 0;
	}
	for(moduleId in moreModules) {
		if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
			modules[moduleId] = moreModules[moduleId];
		}
	}
	if(parentJsonpFunction) parentJsonpFunction(data);
	while(resolves.length) {
		resolves.shift()();
	}
	// add entry modules from loaded chunk to deferred list
	deferredModules.push.apply(deferredModules, executeModules || []);
	// run deferred modules when all chunks ready
	return checkDeferredModules();
};
```

首先传递的参数是一个数组，数组里预期是有三个参数，分别为 chunkId数组、Module数组、执行过的Module数组。然后对chunkId数组遍历并且判断是否之前chunk是否安装过，如果
已经安装过该chunk，则放入 `resolves` 数组中，最后标记为已加载完状态。（这里猜测installedChunks[chunkId]是一个元素为Promise的数组），因为 `installedChunks` 的定义有这样的注释：

``` js
// object to store loaded and loading chunks
// undefined = chunk not loaded, null = chunk preloaded/prefetched
// Promise = chunk loading, 0 = chunk loaded
var installedChunks = {
	1: 0
};
```

接下来就是遍历 `moreModules` 数组，把 `moreModules` 里的元素赋值给 `modules`。

接下来遍历 `reoslves` 并执行数组中的 Promise。


#### optimization.noEmitOnErrors

`boolean`

在输出阶段时，遇到编译错误跳过。这样可以确保输出资源不会包含错误。对于所有资源，统计资料(stat)的 emitted 标识都是 false。可参考 `NoEmitOnErrorsPlugin`。

#### optimization.namedModules（已废弃）

`boolean: false`

告诉webpack使用可读模块标识符以获得更好的调试（取代ids）。如果未在webpack配置中设置 `optimization.namedModules` ，则在开发模式中默认为开启，在生产模式中默认为不开启。

**webpack.config.js**

``` js
module.exports = {
  //..
  optimization: {
    namedModules: true
  }
}
```

#### optimization.moduleIds

`bool: false` `string: natural, named, hashed, size, total-size`

告诉webpack在选择模块 `ids` 时使用哪种算法。将 `optimization.moduleIds` 设置为 `false` 告诉webpack不应使用任何内置算法，因为可以通过插件提供自定义算法。
默认情况下，`optimization.moduleIds` 设置为 `false`。

支持以下字符串值：

* natural: 数字 `ids` 按使用顺序排列
* named: 可读的 `ids` 用于更好的调试
* hashed: 用于长缓存的简短的hash值作为 `ids`
* size: 由初始化下载的大小决定 `ids`
* total-size: 由全部下载的大小值来决定 `ids`

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    moduleIds: 'hashed'
  }
};
```

#### optimization.chunkIds

`bool: false` `string: natural, named, size, total-size`

告诉 `webpack` 在选择 `chunk` `ids` 时使用哪种算法。将 `optimization.chunkIds` 设置为 `false` 告诉 `webpack` 不应使用任何内置算法，因为可以通过插件提供自定义算法。

optimization.chunkIds有几个默认值：

* 如果启用了 `optimization.occurrenceOrder`，则 `optimization.chunkIds` 设置为'total-size'
* 如果 `optimization.namedChunks`开启，则忽略之前的假设，设置为 'named'
* 如果以上都不是，`optimization.namedChunks` 将默认为'natural'

支持以下字符串值：

* natural: 数字 `ids` 按使用顺序排列
* named: 可读的 `ids` 用于更好的调试
* size: 由初始化下载的大小决定 `ids`
* total-size: 由全部下载的大小值来决定 `ids`

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    chunkIds: 'named'
  }
};
```

#### optimization.nodeEnv

`string` `bool: false`

设置 `process.env.NDOE_ENV` 为一个给定的值。`optimization.nodeEnv` 使用 `DefinePlugin` 插件，除非设置为 `false`。`nodeEnv`默认为 `mode`所设置的值，否则为 `production`。

可能的值：

* 任何字符串：该值会设置在 `process.env.NODE_ENV` 上。
* false：不修改/设置 `process.env.NODE_ENV` 值。

**webpack.config.js**

``` js
module.exports = {
  // ..
  optimization: {
    nodeEnv: 'production'
  }
};
```

#### optimization.mangleWasmImports

`bool: false`

设置为true时，告诉webpack通过将导入的内容更改为更短的字符串来减小WASM的大小。它会破坏模块和导出名称。（WASM === WebAssembly）


####  optimization.removeAvailableModules

`bool: true`

移除在父 chunk 中已经存在并且可用的 chunk。这会减少资源的大小。更少的资源会加快构建速度。

#### optimization.removeEmptyChunks

`bool: true`

移除空的chunk。

#### optimization.mergeDuplicateChunks

`bool: true`

合并相同的 chunk。结果是更少的代码生成和更快的构建速度。

#### optimization.flagIncludedChunks

`bool`

如果当前标记的chunk是另外一个chunk 的子集并且已经加载完成时，当前标记的chunk 将不会再次加载。

默认生产模式下开启。

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    flagIncludedChunks: true
  }
};
```

好处是更少的请求和下载数量，缺点是有构建时间成本。

#### optimization.occurrenceOrder

`bool`

使用更短的 `ids` 命名使用频率高的模块。

生产模式下默认开启。

好处是减少bundle的大小，缺点是有构建时间的成本。

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    occurrenceOrder: false
  }
};
```

#### optimization.providedExports

`bool`

尽可能的确定每个模块的导出。其他优化或者代码生成依赖此信息。例如对于 `export * from` 这种代码生成更高效的代码。

默认为开启。

**webpack.config.js**

``` js
module.exports = {
  optimization: {
    providedExports: false
  }
}
```

好处是减少bundle的大小，缺点是有构建时间的成本。

#### optimization.usedExports

`bool`

确定每个模块导出的使用情况。这依赖于 `optimization.providedExports`。是 production 模式下其他优化或代码生成的前置条件，如更彻底的代码混淆、去除无效 export 等。

默认生产模式下开启。

#### optimization.concatenateModules

`bool`

尝试找到模块间的关联关系并将可以合并的模块合并掉。依赖于 `optimization.providedExports` 和 `optimization.usedExports`。
如：a.js 依赖于 loadash 且项目只有 a.js 引用了 loadash ，那么 a.js 和 loadash 就可以合并成一个模块,用来提高运行时的解析速度，会产生很多额外的消耗（额外的语法分析、作用域分析等等）。

默认生产模式下开启。

好处是减少bundle的大小，提高运行时的性能。缺点是有构建时间成本。


#### optimization.sideEffects

`bool`

识别package.json中的sideEffects标志或规则以消除模块（shaking掉）。

``` json
{
  "name": "awesome npm module",
  "version": "1.0.0",
  "sideEffects": false
}
```

*请注意，sideEffects应该在npm模块的package.json文件中，并不意味着你需要在你自己的项目的package.json中将sideEffects设置为false，那会导入很大的模块。*

`optimization.sideEffects` 取决于 `optimize.providedExports` 要启用。此依赖项具有 **构建时间成本**，但由于 **代码生成较少** ，因此消除模块会对性能产生积极影响。此优化的效果取决于您的代码库，尝试获得可能的性能。

默认生产模式下是启用的。

如:import { debounce } from 'lodash'等价于 import debounce from 'lodash/lib/debounce',而不是将整个 loadash 载入进来。

[加深理解](https://segmentfault.com/a/1190000015689240)

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    sideEffects: true
  }
};

```

#### optimization.portableRecords

`boolean`

`optimization.portableRecords` 告诉 `webpack` 生成具有相对路径的记录，以便能够移动上下文文件夹。

默认情况下，optimize.portableRecords被禁用。如果以下记录选项至少被提供一个则自动开启：

* recordsPath
* recordsInputPath
* recordsOutputPath

**webpack.config.js**

``` js
module.exports = {
  //...
  optimization: {
    portableRecords: true
  }
};
```

## 参考链接

webpack项目配置：https://github.com/webpack/webpack/blob/master/schemas/WebpackOptions.json
长缓存：https://developers.google.com/web/fundamentals/performance/webpack/use-long-term-caching
https://github.com/dwqs/blog/issues/60
https://segmentfault.com/a/1190000015919863
https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31
https://medium.com/webpack/webpack-4-mode-and-optimization-5423a6bc597a
http://forgetting.me/?p=210


待看：
https://blog.csdn.net/sinat_17775997/article/details/83023148
https://segmentfault.com/a/1190000015919863
https://sebastianblade.com/using-webpack-to-achieve-long-term-cache/
https://markus.oberlehner.net/blog/setting-up-a-vue-project-with-webpack-4-and-babel-7/

test23456
