# 浏览器中的滚动——移动端篇

关于移动端的滚动问题，真的很多，也很杂乱。每次解决问题，都需要从网上东找西凑。所以打算好好的总结（好好上网找找）关于移动端滚动的知识点。

## 关于滚动的预备知识

### 滚动事件

滚动事件，即 [`onscroll` 事件](https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalEventHandlers/onscroll)，触发（形成）的原因是子元素高度高于父元素的高度时，就会形成滚动条，滚动条分为两种：局部滚动和body滚动。

### onscroll

一般情况下当我们需要监听一个滚动事件时通常会用到onscroll方法来监听滚动事件的触发。

### body滚动

在移动端如果使用body滚动，意思就是页面的高度由内容自动撑大，body自然形成滚动条，这时我们监听window.onscroll，发现onscroll并没有实时触发，只在手指触摸的屏幕上一直滑动时和滚动停止的那一刻才触发,采用了wk内核的webview除外。

### 局部滚动

在移动端如果使用局部滚动，意思就是我们的滚动在一个固定宽高的div内触发，将该div设置成overflow:scroll/auto;来形成div内部的滚动，这时我们监听div的onscroll发现触发的时机区分android和ios两种情况，具体可以看下面表格：

|---|----|----|
| |body滚动|局部滚动|
|---|----|----|
|ios|不能实时触发|不能实时触发
|---|----|----|
|android|实时触发|实时触发
|---|----|----|
|ios |wkwebview内核|实时触发|实时触发

### wkwebview and uiwebview

在ios中有自己的浏览器组件，它就是UIWebView, UIWebView是IOS上对WebKit的封装，WebKit是渲染引擎，UIWebView是渲染引擎和JS引擎的组合。

UIWebView是基于移动版的Safari的，所以它的性能表现十分有限。特别是在对几乎每个Web应用都会使用的JavaScript，表现的尤为糟糕。 

混合应用和原生应用类似。它们也是从Google Play或App Store上安装，只不过它们是使用HTML、CCS、JavaScript之类的技术开发的。浏览器引擎用于解析、运行和显示这些应用，每个操作系统都为引擎导出了API与之交互。在Android下，这个引擎就是WebView，iOS下则叫WKWebView。开发者可以在他们的应用中嵌入Web内容，以及访问那些一般的移动网站无法访问的资源，比如摄像头、文件系统和NFC等等 。

在WWDC 2014发布会上发布iOS 8中，apple公布了WebKit框架,这意味着OSX和IOS开发者将共用同样的开发库，新改变可以提高开发者编写的代码的重复使用性。WebKit框架使用WKWebView来代替IOS的UIWebView和OSX的WebView，并且使用Nitro JavaScript引擎，这意味着所有第三方浏览器运行JavaScript将会跟safari一样快。

### WKWebView 简介

WKWebView 是苹果在 iOS 8 中引入的新组件，目的是给出一个新的高性能的 Web View 解决方案，摆脱过去 UIWebView 的老旧笨重特别是内存占用量巨大的问题。

苹果将 UIWebViewDelegate 与 UIWebView 重构成了 14 个类和 3 个协议，引入了不少新的功能和接口，这可以在一定程度上看做苹果对其封锁 Web View 内核的行为作出的补偿：既然你们都说 UIWebView 太渣，那我就造一个不渣的给你们用呗~~ 众所周知，连 Chrome 的 iOS 版用的也是 UIWebView 的内核。

WKWebView 有以下几大主要进步：

将浏览器内核渲染进程提取出 App，由系统进行统一管理，这减少了相当一部分的性能损失。

js 可以直接使用已经事先注入 js runtime 的 js 接口给 Native 层传值，不必再通过苦逼的 iframe 制造页面刷新再解析自定义协议的奇怪方式。

支持高达 60 fps 的滚动刷新率，内置了手势探测。

**所以，我们知道在Android机器上一般是不会出现滚动不流畅这种问题的，而出问题的往往是使用了uiwebview的浏览器（比如手q，手机百度）**

*关于uiwebview的bug集锦：https://harttle.land/2018/06/23/uiwebview-bugs.html*

### 关于模拟滚动

正常的滚动是指我们平时使用的scroll，包括上面讲的滚动都属于正常滚动，利用浏览器自身提供的滚动条来实现滚动，底层是由浏览器内核控制，其滚动性能会很好。

模拟滚动：最典型的例子就是iscroll了，原理一般有两种：

1. 监听滚动元素的touchmove事件，当事件触发时修改元素的transform属性来实现元素的位移，让手指离开时触发touchend事件，然后采用requestanimationframe来在一个线型函数下不断的修改元素的transform来实现手指离开时的一段惯性滚动距离。
2. 监听滚动元素的touchmove事件，当事件触发时修改元素的transform属性来实现元素的位移，让手指离开时触发touchend事件，然后给元素一个css的animation，并设置好duration和function来实现手指离开时的一段惯性距离。

这两种方案对比起来各有好处，第一种方案由于惯性滚动的时机时由js自己控制所以可以拿到滚动触发阶段的scrolltop值，并且滚动的回调函数onscroll在滚动的阶段都会触发。

第二种方案相比第一种要劣势一些，区别在于手指离开时，采用的时css的animation来实现惯性滚动，所以无法直接触发惯性滚动过程中的onscroll事件，只有在animation结束时才可以借助animationend来获取到事件，当然也有一种方法可以实时获取滚动事件，也是借助于requestanimationframe来不断的去读取滚动元素的transform来拿到scrolltop同时触发onscroll回调。

## 在移动端遇到的滚动问题

