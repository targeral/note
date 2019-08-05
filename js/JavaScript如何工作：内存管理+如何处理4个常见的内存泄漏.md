# JavaScript如何工作：内存管理+如何处理4个常见的内存泄漏

## 概述

像C这样的语言具有低级内存管理的原语，例如`malloc()`和`free()`。开发人员使用这些原语来明确地从操作系统分配和释放内存。

而JavaScript在创建事物（对象，字符串等）时分配内存，并在不再使用时“自动”释放它，这个过程称为垃圾收集。这种看似“自动”的释放资源的本质是混乱的根源，并给JavaScript（和其他高级语言）开发人员提供了错误的印象，他们可以选择不关心内存管理。这是一个大错误。

即使使用高级语言，开发人员也应该了解内存管理（或至少是基础知识）。有时自动内存管理存在问题（例如垃圾收集器中的错误或实现限制等），开发人员必须了解这些问题才能正确处理它们（或找到合适的解决方法，并尽量减少折衷和代码债务）。

## 内存生命周期

无论您使用何种编程语言，内存生命周期几乎都是一样的。

![](https://cdn-images-1.medium.com/max/1600/1*slxXgq_TO38TgtoKpWa_jQ.png)

以下概述了生命周期每一步发生了什么：

* **分配内存** - 内存由操作系统分配，允许程序使用它。在低级语言（例如C）中，这是您作为开发人员应该处理的显式操作。但是，在高级语言中，这将不由你来操作。

* **使用内存** - 这是时候是程序实际使用以前分配的内存的阶段。当您在代码中使用分配的变量时，实际上是正在进行读写操作。
* **释放内存** - 现在是时候释放您不需要的整个内存，以便它可以免费再次使用。与分配内存操作一样，这个操作在低级语言中是明确的。

为了快速概述调用堆栈和内存堆的概念，您可以阅读我们关于该主题的第一篇文章。

## 内存是什么？

在用JavaScript直接跳转到内存之前，我们将简要地讨论一下内存是什么以及它是如何工作的。

在硬件的角度，电脑内存由大量的01寄存器组成。每个01寄存器包含几个晶体管并且能够存储一位。单个01寄存器可通过唯一标识符进行寻址，因此我们可以读取和覆盖它们。因此，从概念上讲，我们可以将整个计算机内存视为我们可以读写的一个巨大的位数组。

因为作为人类，我们并不善于完成所有的思考和算术，我们将它们组织成更大的组，它们可以用来表示数字。8位称为1字节。超出字节，有单词（有时是16，有时是32位）。

很多东西都存储在这个内存中：

1. 所有程序使用的所有变量和其他数据。
2. 程序的代码，包括操作系统

编译器和操作系统一起工作，为您处理大部分内存管理，但我们建议您先了解一下发生了什么。

编译代码时，编译器可以检查原始数据类型并提前计算它们需要多少内存。然后将所需的内容分配给调用堆栈空间中的程序。分配这些变量的空间称为堆栈空间，因为在调用函数时，它们的内存会添加到现有内存之上。当它们终止时，它们将以LIFO（后进先出）顺序被移除。例如，请考虑以下声明：

```
int n; // 4 bytes
int x[4]; // array of 4 elements, each 4 bytes
double m; // 8 bytes
```

编译器可以立即知道代码所需：`4 + 4 × 4 + 8 = 28 bytes.`

*这就是整数和双精度当前大小的工作原理。大约20年前，整数通常是2个字节， double 4个字节。您的代码永远不必依赖于此时基本数据类型的大小。*

编译器将插入将与操作系统交互的代码，以请求堆栈上必要的字节数，以便存储变量。

在上面的示例中，编译器知道每个变量的确切内存地址。实际上，每当我们写入变量n时，它就会在内部转换为类似“内存地址4127963”的内容。

请注意，如果我们在这里尝试访问 `x[4]`，我们将访问与m相关的数据。那是因为我们正在访问数组中不存在的元素 - 它比数组中最后一个实际分配的元素 `x[3]` 多4个字节，并且可能最终读取（或覆盖）某些m变量的位。这几乎肯定会对该计划的其余部分产生非常不利的后果。

![](https://cdn-images-1.medium.com/max/1600/1*5aBou4onl1B8xlgwoGTDOg.png)

当函数调用其他函数时，每个函数在调用时都会获得自己的堆栈块。它将所有局部变量保存在那里，还有一个程序计数器，可以记住它在执行中的位置。当函数完成时，其内存块再次被释放可用于其他事情。

## 动态分配

不幸的是，当我们在编译时不知道变量需要多少内存时，事情就不那么容易了。假设我们想要做类似以下的事情：

```
int n = readInput(); // reads input from the user
...
// create an array with "n" elements
```

这里，在编译时，编译器不知道数组需要多少内存，因为它由用户提供的值确定。

因此，它无法为堆栈上的变量分配空间。相反，我们的程序需要在运行时明确询问操作系统是否有适当的空间量。此内存是从堆空间分配的。静态和动态内存分配之间的差异总结在下表中：

![](https://cdn-images-1.medium.com/max/1600/1*qY-yRQWGI-DLS3zRHYHm9A.png)

要完全理解动态内存分配的工作原理，我们需要花更多时间在指针上，这可能与本文的主题有点过多的偏差。

## JavaScript中的分配

现在我们将解释第一步（分配内存）如何在JavaScript中工作。JavaScript使开发人员免于处理内存分配的责任 - JavaScript自行完成，同时声明值。

``` js
var n = 374; // allocates memory for a number
var s = 'sessionstack'; // allocates memory for a string 
var o = {
  a: 1,
  b: null
}; // allocates memory for an object and its contained values
var a = [1, null, 'str'];  // (like object) allocates memory for the
                           // array and its contained values
function f(a) {
  return a + 3;
} // allocates a function (which is a callable object)
// function expressions also allocate an object
someElement.addEventListener('click', function() {
  someElement.style.backgroundColor = 'blue';
}, false);
```

一些函数调用也会导致对象分配内存：

``` js
var d = new Date(); // allocates a Date object
var e = document.createElement('div'); // allocates a DOM element
```

方法可以分配新的值或对象：

``` js
var s1 = 'sessionstack';
var s2 = s1.substr(0, 3); // s2 is a new string
// Since strings are immutable, 
// JavaScript may decide to not allocate memory, 
// but just store the [0, 3] range.
var a1 = ['str1', 'str2'];
var a2 = ['str3', 'str4'];
var a3 = a1.concat(a2); 
// new array with 4 elements being
// the concatenation of a1 and a2 elements
```

## 在JavaScript中使用内存

基本上在JavaScript中使用分配的内存意味着在其中读取和写入。这可以通过读取或写入变量或对象属性的值，甚至将参数传递给函数来完成。

## 当内存不再需要的时候释放

大多数内存管理的问题都发生在这个阶段。

这里最艰难的任务是弄清楚何时不再需要分配的内存。它通常需要开发人员确定程序中的哪个位置不再需要这些内存并释放它。

高级语言嵌入了一个名为垃圾收集器的软件，其工作是跟踪内存分配和使用，以便找到不再需要分配内存的时刻，在这种情况下，它将自动释放它。

不幸的是，这个过程是近似的，因为知道是否需要某个存储器的一般问题是不可判定的（不能通过算法解决）。

大多数垃圾收集器通过收集不能再访问的存储器来工作，例如，指向它的所有变量都超出了范围。然而，这是一个可以收集的内存空间集的低估，因为在任何一点上，内存位置可能仍然有一个在范围内指向它的变量，但它永远不会被再次访问。

## 垃圾收集

由于发现某些内存是否“不再需要”是不可判定的事实，垃圾收集实现了对一般问题的解决方案的限制。本节将解释了解主要垃圾收集算法及其局限性的必要概念。

## 内存引用

垃圾收集算法所依赖的主要概念是引用。

在内存管理的上下文中，如果前者具有对后者的访问权（可以是隐式的或显式的），则称该对象引用另一个对象。例如，JavaScript对象具有对其原型（隐式引用）及其属性值（显式引用）的引用。

在这种情况下，“对象”的概念扩展到比常规JavaScript对象更广泛的东西，并且还包含函数作用域（或全局词法作用域）。

*词法范围定义如何在嵌套函数中解析变量名称：内部函数包含父函数的范围，即使父函数已返回。*

## 引用计数垃圾收集

这是最简单的垃圾收集算法。如果指向它的零引用，则该对象被视为“垃圾收集”。看看下面的代码：

``` js
var o1 = {
  o2: {
    x: 1
  }
};
// 2 objects are created. 
// 'o2' is referenced by 'o1' object as one of its properties.
// None can be garbage-collected

var o3 = o1; // the 'o3' variable is the second thing that 
            // has a reference to the object pointed by 'o1'. 
                                                       
o1 = 1;      // now, the object that was originally in 'o1' has a         
            // single reference, embodied by the 'o3' variable

var o4 = o3.o2; // reference to 'o2' property of the object.
                // This object has now 2 references: one as
                // a property. 
                // The other as the 'o4' variable

o3 = '374'; // The object that was originally in 'o1' has now zero
            // references to it. 
            // It can be garbage-collected.
            // However, what was its 'o2' property is still
            // referenced by the 'o4' variable, so it cannot be
            // freed.

o4 = null; // what was the 'o2' property of the object originally in
           // 'o1' has zero references to it. 
           // It can be garbage collected.
```

## 循环引用产生的问题

在循环引用方面存在限制。在以下示例中，创建了两个对象并相互引用，从而创建了一个循环。在函数调用之后它们将超出范围，因此它们实际上是无用的并且可以被释放。但是，引用计数算法认为，由于两个对象中的每一个至少被引用一次，因此都不能进行垃圾收集。

``` js
function f() {
  var o1 = {};
  var o2 = {};
  o1.p = o2; // o1 references o2
  o2.p = o1; // o2 references o1. This creates a cycle.
}

f();
```

![](https://cdn-images-1.medium.com/max/1600/1*GF3p99CQPZkX3UkgyVKSHw.png)

## 标记和扫描算法

该算法通过对象是否可达来确定是否需要该对象。

标记和扫描算法通过以下3个步骤：

1. 根：一般来说，根是在代码中引用的全局变量。例如，在JavaScript中，可以充当根的全局变量是“窗口”对象。
Node.js中的相同对象称为“全局”。垃圾收集器构建了所有根的完整列表。
2. 然后算法检查所有根和它们的孩子并将它们标记为活动（意思是，它们不是垃圾）。root无法访问的任何内容都将被标记为垃圾。
3. 最后，垃圾收集器释放所有未标记为活动的内存块，并将该内存返回给操作系统。

![](https://cdn-images-1.medium.com/max/1600/1*WVtok3BV0NgU95mpxk9CNg.gif)


该算法优于前一个算法，因为“一个对象具有零引用”导致该对象无法访问。正如我们在循环引用中看到的那样，情况正好相反。

截至2012年，所有现代浏览器都提供了标记 - 清除垃圾收集器。在过去几年中，在JavaScript垃圾收集（生成/增量/并发/并行垃圾收集）领域所做的所有改进都是该算法的实现改进（标记和扫描），但不是对垃圾收集算法本身的改进，也没有它的目标是决定一个对象是否可达。

在[本文](https://en.wikipedia.org/wiki/Tracing_garbage_collection)中，您可以更详细地阅读跟踪垃圾收集，其中还包括标记和清除及其优化。

## 循环引用不再是问题

在上面的第一个示例中，在函数调用返回之后，两个对象不再被从全局对象可到达的内容引用。因此，垃圾收集器将无法访问它们。

![](https://cdn-images-1.medium.com/max/1600/1*FbbOG9mcqWZtNajjDO6SaA.png)

尽管对象之间存在引用，但它们无法从根访问。

## 垃圾收集器的反直觉行为

虽然垃圾收集器很方便，但它们还有自己的权衡取舍。其中之一是非决定论。换句话说，GC是不可预测的。您无法确定何时会执行收集。这意味着在某些情况下，程序会使用更多实际需要的内存。在其他情况下，在特别敏感的应用中，短暂停顿可能会很明显。尽管非确定性意味着无法确定何时执行集合，但大多数GC实现都共享在分配期间执行集合过程的常见模式。如果没有执行分配，则大多数GC保持空闲。请考虑以下情形：

1. 执行大量分配。
2. 大多数这些元素（或所有元素）都被标记为无法访问（假设我们将指向我们不再需要的缓存的引用置空）。
3. 没有进一步的分配。

在这种情况下，大多数GC不会再运行任何收集通行证。换句话说，即使存在可用于收集的无法访问的引用，收集器也不会声明这些引用。这些并非严格泄漏，但仍导致高于平常的内存使用率。

## 什么是内存泄漏？

就像内存所暗示的那样，内存泄漏是应用程序过去使用但不再需要的内存但尚未返回操作系统或可用内存池的内存块。

编程语言支持不同的内存管理方式。但是，是否使用某段内存实际上是一个不可判定的问题。换句话说，只有开发人员才能明确是否可以将一块内存返回给操作系统。

某些编程语言提供了帮助开发人员执行此操作的功其他人希望开发人员完全明确何时未使用内存。维基百科有关于手动和自动内存管理的好文章。

## 四种常见JavaScript泄漏的类型

### 1. 全局变量

JavaScript以一种有趣的方式处理未声明的变量：当引用未声明的变量时，会在全局对象中创建一个新变量。在浏览器中，全局对象将是窗口，这意味着：

``` js
function foo(arg) {
    bar = "some text";
}
```

相当于：

``` js
function foo(arg) {
    window.bar = "some text";
}
```

假设bar的目的是仅引用foo函数中的变量。但是，如果不使用var来声明它，则会创建一个冗余的全局变量。在上述情况下，这不会造成太大伤害。你肯定可以想象一个更具破坏性的场景。您还可以使用以下方法意外创建全局变量：

``` js
function foo() {
    this.var1 = "potential accidental global";
}
// Foo called on its own, this points to the global object (window)
// rather than being undefined.
foo();
```

*你可以通过添加'use strict'来避免这一切;在JavaScript文件的开头，它将打开更严格的解析JavaScript模式，以防止意外创建全局变量*

意外的全局变量肯定是个问题，但是，通常情况下，您的代码会被显式的全局变量所侵扰，而这些变量根据定义无法被垃圾收集器收集。需要特别注意用于临时存储和处理大量信息的全局变量。如果必须，使用全局变量来存储数据，但是当您这样做时，请确保将其指定为null或在完成后重新分配它。

### 2：忘记的定时器或回调

我们以setInterval为例，因为它经常在JavaScript中使用。

提供观察者和其他接受回调的工具的库通常会确保一旦其实例也无法访问，所有对回调的引用都将无法访问。
不过，下面的代码并不罕见：

``` js
var serverData = loadData();
setInterval(function() {
    var renderer = document.getElementById('renderer');
    if(renderer) {
        renderer.innerHTML = JSON.stringify(serverData);
    }
}, 5000); //This will be executed every ~5 seconds.
```

上面的代码段显示了使用引用不再需要的节点或数据的计时器的后果。

可以在某些点处替换或移除渲染器对象，这将使由间隔处理器封装的块冗余。如果发生这种情况，处理程序及其依赖关系都不会被收集，因为需要首先停止间隔（记住，它仍处于活动状态）。这一切都归结为这样一个事实，即无法收集确实存储和处理数据量的。

使用观察者时，您需要确保在完成它们之后进行显式调用以删除它们（不再需要观察者，或者对象将无法访问）。

幸运的是，大多数现代浏览器都能为您完成这项工作：即使您忘记移除侦听器，一旦观察到的对象无法访问，它们也会自动收集观察者处理程序。在过去，一些浏览器无法处理这些情况（旧的IE6）。

尽管如此，一旦对象变得过时，它仍然符合删除观察者的最佳实践。请参阅以下示例：

``` js
var element = document.getElementById('launch-button');
var counter = 0;
function onClick(event) {
   counter++;
   element.innerHtml = 'text ' + counter;
}
element.addEventListener('click', onClick);
// Do stuff
element.removeEventListener('click', onClick);
element.parentNode.removeChild(element);
// Now when element goes out of scope,
// both element and onClick will be collected even in old browsers // that don't handle cycles well.
```

在使节点无法访问之前，您不再需要调用removeEventListener，因为现代浏览器支持可以检测这些循环并适当处理它们的垃圾收集器。

如果您利用jQuery API（其他库和框架也支持它），您也可以在节点过时之前删除侦听器。即使应用程序在较旧的浏览器版本下运行，该库也将确保没有内存泄漏。

### 3：闭包

JavaScript开发的一个关键方面是闭包：一个内部函数，可以访问外部（封闭）函数的变量。由于JavaScript运行时的实现细节，可能会以下列方式泄漏内存：

一旦调用了replaceThing，theThing将获得一个新对象，该对象由一个大数组和一个新的闭包（someMethod）组成。
然而，originalThing由一个由未使用的变量保持的闭包引用（它是从之前调用replaceThing的theThing变量）。
要记住的是，一旦为同一父作用域中的闭包创建了闭包范围，就会共享作用域。

在这种情况下，为闭包someMethod创建的作用域与未使用的共享。unused具有对originalThing的引用。即使从未使用过者，someMethod也可以通过在replaceThing范围之外的toThing使用（例如全局某处）。并且由于someMethod与未使用的内容共享闭包范围，因此未使用的引用必须使originalThing强制它保持活动状态（两个闭包之间的整个共享范围）。这可以阻止其收集。

所有这些都可能导致相当大的内存泄漏。当上述代码段反复运行时，您可能会看到内存使用量激增。当垃圾收集器运行时，它的大小不会缩小。创建了一个关联的链接列表（在这种情况下，它的根是theThing变量），每个闭包范围都会对大数组进行间接引用。

这个问题是由Meteor团队发现的，他们有一篇很棒的[文章](https://blog.meteor.com/an-interesting-kind-of-javascript-memory-leak-8b47d2e7f156)，详细描述了这个问题。

### 超出DOM引用

在某些情况下，开发人员将DOM节点存储在数据结构中。假设您要快速更新表中多行的内容。如果存储对字典或数组中每个DOM行的引用，则会有两个对同一DOM元素的引用：一个在DOM树中，另一个在字典中。如果您决定删除这些行，则需要记住使两个引用都无法访问。

```js
var elements = {
    button: document.getElementById('button'),
    image: document.getElementById('image')
};
function doStuff() {
    elements.image.src = 'http://example.com/image_name.png';
}
function removeImage() {
    // The image is a direct child of the body element.
    document.body.removeChild(document.getElementById('image'));
    // At this point, we still have a reference to #button in the
    //global elements object. In other words, the button element is
    //still in memory and cannot be collected by the GC.
}
```

在引用DOM树内的内部或叶子节点时，还需要考虑一个额外的考虑因素。如果您在代码中保留对表格单元格（`<td>`标记）的引用并决定从DOM中删除该表但保留对该特定单元格的引用，则可能会出现严重的内存泄漏。您可能认为垃圾收集器会释放除该单元之外的所有内容。然而，情况并非如此。由于单元格是表的子节点，并且子节点保留对其父节点的引用，因此对表格单元格的单个引用将使整个表格保留在内存中。