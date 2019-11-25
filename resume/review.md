# review

* webpack 1d
* 熟悉移动端相关的 HTML，CSS，JS 开发技术。1d
* js 1d
* css + node 1d
* react + ts 1d
* pwa + 设计模式 1d
* flutter + Taro + VDOM + Mono，Monorepo，RxJS，CSS
houdini。1d
* 图片懒加载实现 + 移动端性能优化 + Hybrid


## js

js engine

两个编译器

* full-codegen 一个简单、快速编译同时生成出简单并且运行较慢的机器码
* Crankshaft 一个更复杂的（即时）优化编译器，可生成高度优化的代码。

* 主线程，执行js代码
* 优化线程，对执行的js代码进行优化
* 优化监测线程，检查js运行中各个部分的所花时间，提供优化线程数据。
* 垃圾回收线程

垃圾回收算法：

1. 计数器
2. 标记

产生内存泄露的情况：

1. 产生全局变量
2. 类似settimeout或者订阅观察者的回调函数未被回收
3. 闭包
4. dom的引用

js
------------------------
内存堆（发生内存分配的地方）|
调用堆栈                 |
------------------------
||
事件循环（event loop）: 监测callstack 和callback queue，如果调用堆栈为空，它将从队列中获取第一个事件，并将其推送到调用堆栈，这将有效地运行它。这种迭代在事件循环中称为tick。每个事件只是一个函数回调。

es6之前，这种功能或行为是由环境提供的。
但是在es6之后，提供了更为细致颗粒化的事件队列控制，引入了 job queue的概念。它是Event Loop队列顶部的一个层。
在处理Promises的异步行为时，你最有可能遇到它。
+
调用队列

浏览器引擎 = js执行线程 + GUI 渲染线程

JS执行（可能需要获取完整CSSOM）=> 等待CSSOM构建完成 => DOM tree 继续构建

浏览器渲染

html => dom tree
css => CSS Rule Tree

render tree

repaint 

reflow

css houdini

js polyfill => babel 