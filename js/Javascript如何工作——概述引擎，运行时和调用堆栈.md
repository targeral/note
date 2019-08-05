# Javascript如何工作——概述引擎，运行时和调用堆栈

## JavaScript引擎

JavaScript引擎的一个流行示例是Google的V8引擎。例如，V8引擎用于Chrome和Node.js。这是一个非常简化的视图：

![](https://cdn-images-1.medium.com/max/1600/1*OnH_DlbNAPvB9KLxUCyMsA.png)

引擎由两个主要组件组成：

* 内存堆 - 这是内存分配发生的地方
* 调用堆栈 - 这是您的代码执行时堆栈帧的位置

## 运行时

浏览器中有几乎所有JavaScript开发人员都使用过的API（例如“setTimeout”）。但是，引擎不提供这些API。

因此他们来自于哪里？

事实上，这个有些复杂：

![](https://cdn-images-1.medium.com/max/1600/1*4lHHyfEhVB0LnQ3HlhSs8g.png)

所以，我们有引擎，但实际上还有很多。我们有一些叫做Web API的东西，它们是由浏览器提供的，比如DOM，AJAX，setTimeout等等。

然后，我们有如此受欢迎的事件循环和回调队列。

## 调用堆栈

JavaScript是一种单线程编程语言，这意味着它只有一个Call Stack。所以，它只能一次完成一件事。

调用栈是一种数据结构，它基本上记录了程序中的位置。如果我们进入函数，我们将它放在堆栈的顶部。如果我们从函数返回，我们会弹出堆栈的顶部。这就是所有堆栈都可以做到的。

我们来看一个例子吧。看看下面的代码：

``` js
function multiply(x, y) {
    return x * y;
}
function printSquare(x) {
    var s = multiply(x, x);
    console.log(s);
}
printSquare(5);
```

当引擎开始执行此代码时，调用堆栈将为空。之后，步骤如下:

![](https://cdn-images-1.medium.com/max/1600/1*Yp1KOt_UJ47HChmS9y7KXw.png)

调用堆栈中的每个条目称为堆栈帧。

这正是在异常被抛出的时候，如何构造堆栈跟踪的方法。——当异常发生时，它基本上是调用堆栈的状态。看下面的代码：

``` js
function foo() {
    throw new Error('SessionStack will help you resolve crashes :)');
}
function bar() {
    foo();
}
function start() {
    bar();
}
start();
```

如果在Chrome中执行此操作（假设此代码位于名为foo.js的文件中），则将生成以下堆栈跟踪：

![](https://cdn-images-1.medium.com/max/1600/1*T-W_ihvl-9rG4dn18kP3Qw.png)

“Blowing the stack” - 当达到最大调用堆栈大小时会发生这种情况。这可能很容易发生，特别是如果你使用递归而不是非常广泛地测试你的代码。看看这个示例代码：

``` js
function foo() {
    foo();
}
foo();
```

当引擎开始执行此代码时，它首先调用函数“foo”。但是，此函数是递归的，并且在没有任何终止条件的情况下开始调用自身。因此，在执行的每个步骤中，相同的函数会一遍又一遍地添加到调用堆栈中。它看起来像这样：

![](https://cdn-images-1.medium.com/max/1600/1*AycFMDy9tlDmNoc5LXd9-g.png)

但是，在某些时候，调用堆栈中的函数调用数量超过了调用堆栈的实际大小，浏览器决定通过抛出错误来执行操作，该错误看起来像这样：

![](https://cdn-images-1.medium.com/max/1600/1*e0nEd59RPKz9coyY8FX-uw.png)

在单个线程上运行代码非常简单，因为您不必处理多线程环境中出现的复杂场景 - 例如，死锁。

但是在单个线程上运行也是非常有限的。由于JavaScript只有一个Call Stack，当事情变慢时会发生什么？

## 并发和事件循环

如果在调用堆栈中有函数调用需要花费大量时间才能处理，会发生什么？例如，假设您想在浏览器中使用JavaScript进行一些复杂的图像转换。

你可能会问 - 为什么这是个问题？问题是，虽然调用堆栈具有执行功能，但浏览器实际上无法执行任何其他操作 - 它会被阻止。这意味着浏览器无法渲染，它无法运行任何其他代码，它只是卡住了。如果您想在应用中使用流畅的UI，这会产生问题。

这不是唯一的问题。一旦您的浏览器开始在调用堆栈中处理如此多的任务，它可能会在相当长的时间内停止响应。大多数浏览器通过引发错误来采取行动，询问您是否要终止网页。

![](https://cdn-images-1.medium.com/max/1600/1*WlMXK3rs_scqKTRV41au7g.jpeg)

那么，我们如何在不阻塞UI并使浏览器无响应的情况下执行繁重的代码呢？好吧，解决方案是异步回调。

这将在“如何实际运行JavaScript”教程的第2部分中进行更详细的解释：“在V8引擎内部+有关如何编写优化代码的5个技巧”。