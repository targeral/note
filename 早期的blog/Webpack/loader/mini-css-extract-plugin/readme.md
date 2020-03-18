# mini-css-extract-plugin

This plugin extracts CSS into separate files. It creates a CSS file per JS file which contains CSS. It supports On-Demand-Loading of CSS and SourceMaps.

*该插件提取CSS到单独的文件里。它为每个包含CSS的JS文件创建了一个CSS文件。它提供了CSS和SourceMap的按需加载。*

> 单词：
>
> * extract：提取
> * separate: 另外的，个别的，分离。
> * On-Demand-Loading: 按需加载。

It builds on top of a new webpack v4 feature (module types) and requires webpack 4 to work.

它建立在新的webpack v4功能（模块类型）之上，并且需要webpack 4才能工作。

Compared to the extract-text-webpack-plugin：

* Async loading
* No duplicate compilation(performace)
* Easier to use
* Specific to CSS

与`extract-text-webpack-plugin`比较：

* 异步加载
* 没有重复编译（性能）
* 简单易用
* 只用于CSS

> 单词：
>
> * duplicate：重复，复制，复本
> * specific：具体，特定，个别

TODO：

* HMR support

TODO:

* 热加载支持

## Install

``` bash
npm install --save-dev mini-css-extract-plugin
```

## Usage

### Configuration

#### Minimal example

**webpack.config.js**

``` js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            filename: '[name].css',
            chunkFilename: '[id].css'
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    { 
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            // you can specify a publicPath here
                            // by default it use publicPath in webpackOption.output
                            publicPath: '../'
                        }
                    },
                    'css-loader'
                ]
            }
        ]
    }
}
```

#### Advanced(高级) configuration example

This plugin should be used only on `production` builds without `style-loader` in the loaders chain(链), especially if you want to have HMR in `development`.

此插件应仅用于生产版本，而不在loader链中使用 `style-loader`，特别是如果您希望在开发中使用热加载。

Here is an example to have both HMR in `development` and your styles extracted in a file for `production` builds.

下面是一个示例，既可以在开发中使用HMR，也可以在生成版本的文件中提取样式。

(Loaders options **left out for clarity(明晰)**（因为清楚而遗漏了）, adapt(适应、改编、改写) accordingly to your needs.)

loader的选项省略了，根据您的需求进行调整。

**webpack.config.js**

``` js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
        })
    ],
    module: {
        rules: [
            text: /\.(sa|sc|c)ss$/,
            use: [
                devMode ? 'style-loader' ? MiniExtractPlugin.loader,
                'css-loader',
                'postcss-loader',
                'sass-loader'
            ]
        ]
    }
}
```

