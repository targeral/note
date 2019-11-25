# my

## 你对flutter有多少了解

首先flutter使用的是dart语言，dart语言在某些语法上与JavaScript很像，因为它综合了动态语言和静态语言的特性。所以dart虽然是强类型语言，但是可以使用var变量，Dart会推到出数据类型，var 实际上是编译期的“语法糖”。

然后是在flutter中，渲染页面的单位是一个个widget。并且存在有状态的widget和无状态的widget。

最后是Flutter 的 Debug 下是 **JIT** 模式，release下是**AOT**模式。

### 关于JIT和AOT

JIT，即Just-in-time,动态(即时)编译，边运行边编译；AOT，Ahead Of Time，指运行前编译，是两种程序的编译方式。

### JIT有什么优点

1. 可以根据当前硬件情况实时编译生成最优机器指令（ps. AOT也可以做到，在用户使用是使用字节码根据机器情况在做一次编译）
2. 可以根据当前程序的运行情况生成最优的机器指令序列
3. 当程序需要支持动态链接时，只能使用JIT
4. 可以根据进程中内存的实际情况调整代码，使内存能够更充分的利用

### JIT缺点

1. 编译需要占用运行时资源，会导致进程卡顿
2. 由于编译时间需要占用运行时间，对于某些代码的编译优化不能完全支持，需要在程序流畅和编译时间之间做权衡
3. 在编译准备和识别频繁使用的方法需要占用时间，使得初始编译不能达到最高性能

### AOT优点

1. 在程序运行前编译，可以避免在运行时的编译性能消耗和内存消耗
2. 可以在程序运行初期就达到最高性能
3. 可以显著的加快程序的启动

### AOT缺点

1. 在程序运行前编译会使程序安装的时间增加
2. 牺牲Java的一致性
3. 将提前编译的内容保存会占用更多的外

## 你对Taro有多少了解


taro是一个多端的解决方案，其语法选择了react，通过写一套代码，将三端的大部分一致的内容表现出来。而三端的不同的特性则通过**跨端文件**解决。

taro实现的大致原理是：源代码->词法/语法/语义分析->抽象语法树->转换->目标代码

### AST

* eslint
* babel
* postcss
* webpack

## 说说你对Virtual DOM的了解

在react和vue框架中使用了virtual dom进行 element的比较、计算、更改。然后了解到vue的virtualdom的实现是使用 snabbdom。它是一个实现virtual dom的库。

Snabbdom的很简单，因为它使用模块化的方式，它对virtual dom的设计非常巧妙，在核心逻辑中只会专注于vNode的更新算法计算，而把每个节点具体要更新的部分，比如props,class,styles,datalist等放在独立的模块里，通过在不同时机触发不同module的钩子函数去完成。通过这样的方式解耦，不仅可以使代码组织结构更加清晰，更可以使得每一部分都专注于实现特定的功能，在设计模式中，这个也叫做单一职责原则。在实际场景使用时，可以只引入需要用到的特定模块。比如我们只会更新节点的类名和样式，而不关心属性以及事件，那么就只需要引用class和style的模块就可以了。例如下面这样，

https://juejin.im/post/5c2ad7f951882565986a2517

## 说说你对Monorepo的了解

monorepo是一种管理代码的方式，在这种方式下会摒弃原先一个 module 一个 repo 的方式，取而代之的是把所有的 modules 都放在一个 repo 内来管理。

而lerna是实现这种管理机制的工具。

我们可以通过lerna对所有的module进行统一管理，对于其构建流程一致的项目来说最好不过。

## 对于Rxjs你了解多少

首先要说rxjs其实是 reactive extension的JavaScript实现，是一个基于可观测数据流在异步编程应用中的库。对于rxjs，流是一个很重要的概念。流是指在时间进程中产生的一系列事件，它具有时间与事件响应的概念。

rxjs的基本原理是观察者模式与迭代器模式以及使用函数编程方式实现这两个模式。

观察者模式在 Web 中最常见的应该是 DOM 事件的监听和触发，通过 addEventListener 订阅 document.body 的 click 事件。当 body 节点被点击时，body 节点便会向订阅者发布这个消息。


rxjs基于stream流，使用观察者模式、迭代器模式

rxjs 关键是 Observable、Observer

https://cloud.tencent.com/developer/article/1486947

## 什么是CSS houdini

CSS Houdini将让开发者接触到实际的CSS引擎，允许我们使用js扩展CSS，并且像css使用它们。
就像Service Workers是浏览器缓存的低级JavaScript API一样，Houdini为浏览器的渲染引擎引入了低级JavaScript API。

### CSS houdini可以做什么？

