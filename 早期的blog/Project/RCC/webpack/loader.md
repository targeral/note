# loader篇

## babel-loader

在使用webpack的时候，当我们对 `js`、`jsx`、`ts`文件处理的时候，可以使用 `babel-loader` 进行transpliling。要想知道 `babel-loader` 做了什么，首先我们要知道 `babel` 是什么？

### babel

> 1. `Babel` 是一个 `JavaScript` **编译器**
> 2. `Babel` 通过语法转换器支持最新版本的 `JavaScript` （语法）。 这些插件允许你立刻使用新语法，无需等待浏览器支持。（插件我们稍后会提到）
> 3. 由于 `Babel` 只转换语法(如箭头函数)， 你可以使用 `babel-polyfill` 支持新的全局变量，例如 `Promise` 、新的原生方法如 `String.padStart` (left-pad) 等。

通过官网的信息，我们能了解到一下几点：

1. `Babel`的主要作用是用于 `JavaScript` 编译器，其中重点是编译器。简单的说，编译器的作用是将一种语法通过 **解析**、**转换**、**生成**，转换为目标语法。`Babel` 就是将最新的 `JavaScript` 语法、`JSX`、`Typescript` 转换为能在浏览器中稳定运行的 `JavaScript`。
2. `Babel`可以通过插件的方式允许我们使用（不同阶段的新语法）。
3. `Babel`只赋予了我们可以使用新的语法，但是对于新增的API，我们需要通过 `babel-polyfill`。

下面我们具体讲解关于Babel的配置内容。

#### Presets

`Babel` 有一些预置的插件。

##### 官方预置

> 每年每个 preset 只编译当年批准的内容。 而 babel-preset-env 相当于 es2015 ，es2016 ，es2017 及最新版本。

* [env](https://www.babeljs.cn/docs/plugins/preset-env/)
* [react](https://www.babeljs.cn/docs/plugins/preset-react/)
* [flow](https://www.babeljs.cn/docs/plugins/preset-flow/)

##### Stage-X (实验阶段 Presets)

Stage-x preset 中的任何转换都是对未被批准为 JavaScript 版本一部分的语言的变化(如 es6 / es2015 )。

> “语言的变化需要一个过程来发展，该过程提供了将一个想法进化为一种完善规范的指导原则。”

[TC39](https://github.com/tc39) 将提案分为以下几个阶段:

* Stage 0 - 稻草人: 只是一个想法，可能是 babel 插件。
* Stage 1 - 提案: 初步尝试。
* Stage 2 - 初稿: 完成初步规范。
* Stage 3 - 候选: 完成规范和浏览器初步实现。
* Stage 4 - 完成: 将被添加到下一年度发布。

#### 关于Babel更多内容

更多内容，查看[官网](https://www.babeljs.cn/docs/plugins/#stage-x-%E5%AE%9E%E9%AA%8C%E9%98%B6%E6%AE%B5-presets)。

### 本项目中使用的Babel插件

由于我们要基于 `React` 构建项目，要使用新版的JavaScript。

那我们使用如下插件和babel相关内容：

* `babel-core`
* `babel-eslint`
* `babel-plugin-import`
* `babel-plugin-transform-decorators-legacy`
* `babel-plugin-transform-runtime`
* `babel-preset-env`
* `babel-preset-react`
* `babel-preset-stage-3`

#### [babel-plugin-import](https://github.com/ant-design/babel-plugin-import)

#### [babel-plugin-transform-decorators-legacy](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy)

#### [@babel/plugin-transform-runtime](https://babeljs.io/docs/en/next/babel-plugin-transform-runtime.html)

 https://segmentfault.com/q/1010000005596587?from=singlemessage&isappinstalled=1, https://github.com/zchen9/code/issues/14, https://babeljs.io/docs/en/babel-plugin-transform-runtime/, https://github.com/lmk123/blog/issues/45


#### [babel-preset-env](https://github.com/babel/babel-preset-env)

### [loader](https://github.com/babel/babel-loader)

针对于 `js`、`jsx`文件，我们要使用 `babel-loader`来对他们进行处理。将 `babel-loader`添加到webpack中的方式如下：

``` js
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }
  ]
}
```

其中的 `options` 选项可以参考 `babel`的配置项：

``` js
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [require('@babel/plugin-proposal-object-rest-spread')]
        }
      }
    }
  ]
}
```

除了类似 `babel`的选项以外，还支持一下选项：

* `cacheDirectory`：默认为 `false`，设置后，给定目录将用于缓存加载器的结果。之后webpack的构建会尝试读取缓存以避免在每次运行时运行可能昂贵的Babel重新编译过程。如果值为空（`loader: 'babel-loader?cacheDirectory`）或者为 `true`（`loader: babel-loader?cacheDirectory=true`）loader将使用 `node_modules/.cache/babel-loader` 目录作为默认的缓存目录。如果在任何根目录中都找不到node_modules文件夹，则为默认的操作系统的临时文件目录。
* `cacheIdentifier`：默认值是由 `babel-core` 的版本，`babel-loader` 的版本，`.babelrc` 文件的内容（如果存在）以及环境变量 `BABEL_ENV` 的值以及`NODE_ENV`环境变量的回退组成的字符串。如果标识符发生更改，可以将其设置为自定义值以强制缓存清除。
* `babelrc`：默认为true。如果为false，则不会使用.babelrc文件中的选项;只会使用传递给babel-loader的选项。

## ts-loader

我们项目中除了要使用React以外，还希望能够使用Typescript。这个时候，我们就需要使用到 `ts-loader`。

### 关于Typescript

`Typescript` 是 `Javascript` 的一个超集。虽然Typescript带给我们很多不错的feature，但是最后它还是会被转换为 `Javascript`。

### [loader](https://github.com/TypeStrong/ts-loader)

所以如果我们想使用 ts 的话，有时候我们还需要和 `babel-loader`进行配合使用。

``` js
{
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    'ts-loader'
                ]
            },
            {
                test: /\.tsx$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                    'ts-loader'
                ]
            },
```

这取决于你的 `tsconfig.js` 文件。

### [tsconfig.js](https://www.tslang.cn/docs/handbook/tsconfig-json.html)

https://www.jianshu.com/p/71bbcdc8c1fc


## style-loader、css-loader、postcss-loader、less-loader

我们已经对 `js`、`jsx`、`ts`、`tsx`文件做了处理，接下来对我们的样式文件做处理。

首先我们要考虑对于 `css` 模块要做什么处理？

### CSS

#### [css-loader](https://github.com/webpack-contrib/css-loader)

对于我们的CSS，总会有使用到 `@import` 和 `url()` 方式引用资源的地方。而对于webpack，他们是无法识别在CSS中的它们（js模块中可以）。所以我们要使用 `css-loader` 来使得在CSS中使用的 `@import` 和 `url()`的方法实现为 `require` 的方式。而对于这种情况，就是使用 `file-loader` 和 `url-loader`的时候（后面会说）。

#### [style-loader](https://github.com/webpack-contrib/style-loader)

当我们处理完我们的CSS之后，如何将我们的CSS插入文档中呢？我们可以使用 `style-loader` 将CSS通过插入 `<style>` 标签的方式插入CSS。

#### 总结

所以我们可以通过这两个loader来实现对CSS模块的处理：

``` js
{
    test: /\.css/,
    use: [
        devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader'
    ]
},
```

*注意：这里的 `MiniCssExtractPlugin.loader`我们之后会讲，它主要是在生产环境下将css样式提取到一个文件下。*

### Less

由于项目的样式开发，我主要使用的是 `less`。所以我们还要考虑关于 `less`模块的处理。

关于less：

> Less 是一门 CSS 预处理语言,它扩展了 CSS 语言,增加了变量、Mixin、函数等特性。Less 可以运行在 Node 或浏览器端。

所以最好无论如何它都会转换为CSS，所以我们的loader处理链中必然要在最后两步使用 `css-loader` + `style-loader` 处理。而说到 `less`，我们一定会想到使用 `less-loader`。

#### [less-loader](https://github.com/webpack-contrib/less-loader)

一般我们的用法是：

``` js
// webpack.config.js
module.exports = {
  ...
  module: {
    rules: [{
      test: /\.less$/,
      use: [{
        loader: 'style-loader' // creates style nodes from JS strings
      }, {
        loader: 'css-loader' // translates CSS into CommonJS
      }, {
        loader: 'less-loader' // compiles Less to CSS
      }]
    }]
  }
};
```

#### [postcss-loader]

但是在由Less转换为CSS之前，我们可能需要对CSS进行一些处理，比如：为了兼容各个浏览器而需要加上的前缀。这个时候就需要 `postcss` 来处理。而想使用 `postcss` 必然会想到使用 `postcss-loader`。

首先我们先了解一下关于 [`postcss`](https://www.npmjs.com/package/postcss)。

> PostCSS是一个使用JS插件转换样式的工具。这些插件可以lint你的CSS，支持变量和mixins，转换未来的CSS语法，内联图像等。

关于 `postcss` 的使用是需要通过 `postcss.config.js` 进行插件的配置。所以 `postcss-loader` 同样也需要一个配置文件。

``` js
module.exports = {
    plugins: {
        'autoprefixer': {},
        'postcss-import': {},
        'postcss-cssnext': {
            browsers: ['last 2 version', '> 5%']
        }
    }
}
```


https://medium.com/a-beginners-guide-for-webpack-2/webpack-loaders-css-and-sass-2cc0079b5b3a
https://medium.com/netscape/my-first-time-writing-a-webpack-loader-bf92d42fff57



