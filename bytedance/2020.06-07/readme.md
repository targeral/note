# 6.10-8.9

## 入职

阅读了jupiter-cli的源码以及app-tools、ui-tools、lib-tools。

### jupiter-cli

首先整体来看，jupiter-cli提供了这些功能：

* core: 
    + 插件系统
    + Hook系统（钩子）
    + 命令行系统
    + 合并配置
    + 配置schema校验
    + 监听文件变化

其中用到的一些模块：

1. [v8-compile-cache](./v8-compile-cache/readme.md)
2. [fs-extra](./fs-extra/readme)
3. [debug]('./debug/readme.md)
4. [path-to-regexp](./Path-to-RegExp/readme.md)
5. [pkg-up](./pkg-up/readme.md)
6. [signale](./signale/readme.md)

* config:
    + 提供了获取相关配置的方法
    + 提供了基于create-react-app的webpack的配置魔改版。对于每一部分都有相应的模块进行修改。
        所以后续新增的feature都是在这里去新增的。

通过对于该模块的了解和实际的开发，了解到了：

1. @pmmmwh/react-refresh-webpack-plugin：一个热更新的插件，能够在使用useState情况下，保持state的值。
2. 掌握了tailwind的使用以及如何进行配置。
3. autoprefixer关于flexbox的配置。

最后有了解了 `cli-plugin-bff`的使用。

### jupiter/app-tools

app-tools基于jupiter-core扩展了jupiter的命令，通过jupiter-core读取用户的配置，然后内部实现了针对于MWA应用的开发、构建、测试、发布。

其中首先做了比较重点的工作是将其中依赖的热更新模块 webpackHotDevClient 进行了低版本机器的兼容。使用rollup进行构建。

### jupiter/lib-tools

lib-tools也是基于jupiter-core扩展了jupiter的命令。主要是针对于库的开发提供开发环境。其中可以对于库进行bundle和nobundle两种方式打包。内部使用了tsdx（bundle模式）和基于babel-cli的打包模块（nobundle模式)。

整个lib-tools的配置通过使用 `jupiter.config.js`或者`package.json`上的babel和rollup字段来配置。

同时lib-tools里提供了 `jupiter new`命令进行创建子项目，整体是一个生成器模块。

最后lib-tools提供了发布流水线的功能。

## 开发UI生成器

生成器的目的是通过在终端问答等交互的方式来获得开发者希望生成项目的配置，然后自动生成开发者需要的代码仓库。包括样板代码的生成、git的初始化、一些配置文件的生成。



## jupiter集成测试

## babel-plugin-ui-tools@2.0.0

## jupiter test BFF

## webpackHotDevClient兼容性处理

## tailwind集成