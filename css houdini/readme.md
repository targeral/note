# CSS Houdini

## CSS带来的便利和存在的限制

在前端开发中，每当我使用CSS的时候，就感觉自己就像是一个“裁缝”或者说是“服装设计师”，我们使用各种布局属性来设置页面的整体就好像是服装整体的架子，使用各种字体属性、颜色属性添加图案（emmm，可以把文字理解为一种图案）就好像在衣服上缝上各种各样的图案和衣扣。有时候我们只需要改变一个属性，就可以让页面发生很大的变化。于是一些看似很复杂的页面，其实就是使用了一些简单的CSS属性实现的。正因为有CSS，我们才可以很容易制作出各种各样很精美的网页。

虽然CSS为我们制作精美的页面样式带来了很多便利，但是需求总是会有一些“特殊”情况，面对设计师天马行空的想象力，我们目前掌握的CSS魔法有时候用起来总会感觉力不从心。即使神圣的“组织”通过一些新的标准来解决一些通病，然而标准出来的内容和标准的实现还是有一定差距的，在不同浏览器厂商下实现带来的兼容性副作用也是前端工程师的苦恼之一。

暂不说兼容性问题，面对一些”奇葩“的需求，不能使用CSS实现的话，我们就只能使用JavaScript。但是使用JavaScript来实现这些“奇葩“的需求就很可能很容易带来我们经常会忽略的问题——性能。那么难道我们真的不能用CSS来实现这些”需求“或者我们在不影响性能的情况下，使用JS来实现吗？这个问题就好像之前的裁缝的例子，裁缝只能将手里的布、线或者一些已经被制作好的图案组合在一起，但是他无法去改变这块布的材料、线的粗细，图案的样式。如果裁缝也能掌握改变这些东西的能力，那么发挥的空间必然是巨大的。那么在前端领域，如果我们能自己实现这些CSS的魔法，那么我们就可以解决这些“特殊”的需求。

于是“组织”打算将CSS这些魔法的一些底层能力（CSS引擎的某些部分）交给我们，让我们可以利用它来实现我们自己的CSS属性，这就是Houdini要做到事。

## 关于CSS Houdini

回到正题，所以什么是Houdini？Houdini是一组API，是将CSS标准工作流中的钩子暴露给开发者用于更好的控制视觉效果或者去实现更好的polyfill。 虽然每个浏览器的CSS标准工作流会有不同，但是Houdini试图和所有浏览器厂商合作，确保每个人都可以使用这些API。

*关于CSS标准工作流的说明（或者叫渲染管道）：包括 style => layout => paint => composite。具体来说，style阶段会去收集所有的样式代码并解析CSS，例如确定哪个元素受到哪个样式的影响；现在知道了宽度和高度，知道了是flexbox或grid，知道了哪个元素对应哪个样式，接下来我们进入layout阶段，我们去做布局，计算元素的大小并在页面上对齐它们；此时它们都还是空的或者透明的，因为接下来我们将按照这种布局去绘制他们，也就是进入了paint的阶段，我们可以在页面绘制所有内容，有时元素会在自己的“纸”上，我们可以称之为layer；于是我们将各种字体颜色、背景颜色、边框颜色等等绘制到各自的“纸”上后，就要把它们使用合成器组合在一起并展示在屏幕上，也就是composite阶段，我们可以在这个阶段去移动这些“纸”，这就是动画的制作方式，当然这只是很通俗的说法*

CSS Houdini有很多API，不过它主要有4个API，分别对应渲染管道的四个主要阶段阶段。然后还有一些low的API用于实现这四个API。这4个主要的API我们在下面介绍，而基础API中，我们主要介绍worklets。

## worklets

worklets在Houdini中就像瑞士军刀的一种。worklets听起来像是workers，不过他们并不是同一个东西，虽然它们有很多重叠的地方，但是有一些重要的区别。

JavaScript有一个概念叫做事件循环。每当事件发生的时候，JavaScript引擎会检查是否存在此事件的处理程序，然后获取该处理程序并将其排在队列中。而一个Workers就像一个独立的事件循环，他有自己的处理程序，自己的事件，并且它与主线程事件循环毫无关系。他们唯一可以通过postMessage将一个任务放入另一个循环中。

worklets跟workers不同，它们虽然也是有独立的代码作用域范围，但是他们没有事件循环，相反他们会附加到已存在的事件循环，这使得它们的创建和维护成本更低。 

## Paints

首先我们要讲一下`CSS Paint API`。

CSS Paint API允许您在使用CSS属性希望获得图像时以编程方式生成图像。例如`background-image`或`border-image`这样的属性通常与`url()`一起使用来加载图像文件或使用CSS内置函数（如`linear-gradient()`）。你现在可以使用`paint(myPainter)`来引用paint worklet，而不是使用url或者CSS内置函数。

举个例子，假如我们希望获得一个具有很“特殊”的圆角的box，你可能会用svg背景图来实现或者画布或者九个切图来实现。但是使用Houdini，你可以教CSS如何绘制你的精确外观在你的页面上。

第一步必须加载你的Worklets文件，我们使用`CSS.paintWorklet.addModule('filename.js')`。

``` js
// main.js
await CSS.paintWorklet.addModule('my-paint.js');
```

你可以观察上面的代码，他们都是在`CSS`对象的方法，每一种Worklet都有`addModule`方法将你的JavaScript加载到对应的work list中。

接下来我们创建`my-paint.js`文件：

``` js
// my-paint.js
class myPaint {
    paint(ctx, geometry, properties) {
        ctx.fillStyle = 'hotpink';
        ctx.arc(
            geometry.width / 2, geometry.height / 2, // center
            Math.min(geometry.width, geometry.height) / 2, // radius
            0, 2 * Math.PI // full circle
        );
        ctx.fill();
    }
}

registerPaint('my-paint', myPaint);
```

接下来我们解释一下这个代码。

我们首先看最下面那行代码，`registerPaint`顾名思义是要注册一个Paint类，第一个参数是定义我们在样式中使用该Paint类的名称，第二个参数是这个Paint类。

接着我们聚焦于这个Paint类，这个类有主要的方法就是paint回调方法，该方法的第一个参数是一个类似`canvas`的`CanvasRenderingContext2D`对象，所以一些canvas上下文的方法，都可以在ctx参数上使用。接着第二个参数是告诉我们可以当前元素的宽度和高度。最后一个参数可以理解为是该paint功能的参数。

我们已经定义了如何绘制这个外观，那么我们如何要告诉浏览器实际使用呢？

``` html
<style>
textarea {
    background-image: paint('my-paint');
}
</style>
```

最后我们成功的实现了一个Houdini用例。不过你可能会感觉这不就是使用画布，所以这里要说一下这里使用Houdini的优点：

* 首先第一点是**Auto Repaint**，浏览器可以自己确定时间来运行这些代码然后执行这些绘制操作，我们会在之后谈一下这个话题。
* 第二点**Auto Size**，如果我们直接使用画布，那么画布的大小我们是直接确定好的，也就说像素数也是确定好的。但是Houdini的大小是自动确定的。
* 第三点是**Off main thread**，虽然我们的代码会在主线程运行，但是我们有worklet的存在，所以我们可以在其他的地方。
* 最后一点是**No DOM overhead**





## 参考链接

https://juejin.im/entry/5acaa4136fb9a028c97a56a4
https://developers.google.com/web/updates/2018/01/paintapi
https://juejin.im/post/5adc091b51882567105f5586
https://developers.google.com/web/updates/2016/05/houdini#css_paint_api
https://drafts.css-houdini.org/css-paint-api/
http://houdini.glitch.me/worklets
https://juejin.im/entry/59f010fdf265da4315231caa
https://zhuanlan.zhihu.com/p/30134423
https://www.youtube.com/watch?v=lK3OiJvwgSc
https://css-houdini.rocks/
https://developers.google.cn/web/fundamentals/performance/rendering/
https://developers.google.cn/web/fundamentals/performance/critical-rendering-path/analyzing-crp
https://developers.google.com/web/updates/2018/10/animation-worklet