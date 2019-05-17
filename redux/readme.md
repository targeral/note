# Redux

## 什么是Redux

Redux是一种数据架构模式，可以帮助我们在单个窗口系统中（单页应用）管理应用程序数据。

简而言之，Redux是一组独立处理应用程序数据的最佳实践和模式。

## 为什么我们需要状态管理

任何前端应用程序的构建模块都是 *component*（它可以是React/angular/ Web组件或任何框架实现）。我们仍然可以将组件进一步分类为 [*Presentational* 和 *Container* 组件](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)。

我们需要通过数据来驱动这些组件，数据在任何应用程序中都起着重要作用。

## 现在的问题是我们需要如何管理数据？

由于组件相互组合以适应视图端口 - 如果我们管理组件内的数据，我们可能最终得到一些脏数据，并且整个应用程序数据可能无法规范化，我们无法全面了解应用程序状态。

解决方案是将应用程序数据与一些经过验证的最佳实践和技术隔离开来 - 这是状态管理框架的唯一目的。


https://medium.com/javascript-in-plain-english/demystifying-redux-with-typescript-2f7c64da5d89

### redux-thunk

https://juejin.im/post/5b035c0c51882565bd258f12