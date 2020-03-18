# 输入框输入相关问题（PC端和移动端）

## 简单的editor模块涉及的输入问题

有一个需求是开发一个文本编辑器，具有以下功能：

1. 左侧有行号，能够随着编辑器的滚动一起滚动。
2. 输入的内容，一行为一个词，一个词限制为20个汉字或者40个字母。词的数量限制为200个。

其中较为关键的就是对于输入的内容进行实时处理。

我们知道对于`input`、`textarea`的表单控件，我们可以通过监听一些事件来达到实时处理输入内容的问题，例如：

* `onkeydown`、`onkeypress`、`onkeyup`
* `onchange`
* `oninput & onpropertychange`

以上是三种解决方案。

### onkeydown + onkeypress + onkeyup

* `onkeydown`：当用户按下键盘时，将触发`keydown`事件。当触发此事件可以获取`keyCode`。例如`a -> 65`、`b -> 66`，但不区分大小写。也就是说大写和小写是一样的`keyCode`。此外当按下键盘不放时，会连续触发该事件。
* `onkeypress`：`keypress`事件只会针对输出文字符号的按键有效，也就是说ESC、方向键、倒退键...等等，这类没有办法输出文字的键无法触发改事件。此外也会因为大小写的不同取到不同的`keyCode`，举例来说：`a -> 97`、`A -> 65`、`b -> 98`、`B -> 66`...。`keypress`也和`keydown`一样，当按下键盘不放时会连续触发该事件。*基于Webkit的浏览器（例如Google Chrome和Safari）不会在箭头键上触发按键事件*
* `onkeyup`: 当用户放开键盘的刹那，触发该事件。因为每次只会放开键盘一次，所以不会有连续触发的状况发生。获取到的`keyCode`基本上跟`keydown`一样。不过若是想获取`input`的`value`，也只有在`keyup`的事件上可以拿到目前最新的`value`。

这三个事件的触发顺序为：`keydown→keypress→keyup`。

**code**：

``` js
editor.addEventListener('keydown', e => {
    console.log('keydown', e.target.value);
});
editor.addEventListener('keypress', e => {
    console.log('keypress', e.target.value);
});

editor.addEventListener('keyup', e => {
    console.log('keyup', e.target.value);
});
```

**result**：

``` bash
keydown
keypress
keyup1
keydown 1
keypress 1
keyup 13
```

通过上面的代码及结果我们知道可以在`keyup`事件获取输入框内容。

当我们通过这种方式监听输入内容时候，正常的输入都可以监听。但是在处理（右键的）复制、粘贴、拖拽、（键盘）长按键等细节上并不是很好，无法获取内容。

**关于组合键：对于组合键使用`keydown`事件进行检测。因为`keypress`只针对能输出文字符号的按键，`keyup`则是键放开才会触发。**


### onchange

`change`事件在HTML DOM API中有两处使用：

* 一处是由`<input>`、`<select>`、`<textarea>`元素内容改变并且失去焦点的时候会触发。但是不像`input`事件，`change`事件不是随着元素的值改变的时候触发。
* 另一处是由`AudioTrackList`对象触发。暂不讨论。

虽然`onchange`事件解决了通过一些组合键或鼠标右键修改输入值的监听问题，但是当通过脚本修改输入内容的时候，就根本不会触发。同时`onchange`事件只有在失去焦点时候才会触发，对于我们实时监听输入内容来说也不是很好。

### oninput + onpropertychange

`oninput`是HTML5的标准事件。对于检测 textarea, input:text, input:password 和 input:search 这几个元素通过用户界面发生的内容变化非常有用，在内容修改后立即被触发。但是由于其兼容性只支持到 **IE9+**，所以对于其他的IE浏览器就要用到`onpropertychange`事件。

**oninput事件和onpropertychange事件的差别**：oninput事件是IE之外的大多数浏览器支持的事件。在value改变时触发，实时的，即每添加或删除一个字符就会触发，然而通过js改变value时。却不会触发；onpropertychange事件是不论什么属性改变都会触发的，而oninput却仅仅在value改变时触发；oninput要通过addEventListener()来注冊，onpropertychange注冊方式跟一般事件一样。（此处都是指在js中动态绑定事件，以实现内容与行为分离） 。

**oninput与onpropertychange失效的情况**：

1. oninput事件：
    * 当脚本中改变value时。不会触发。
    * 从浏览器的自己主动下拉提示中选取时，不会触发。
2. onpropertychange事件：当input设置为disable=true后。onpropertychange不会触发。

## React input输入框onChange事件的坑

### Controlled Components

在HTML中，表单元素例如`<input>`、`<textarea>`和`<select>`通常维护自己的状态并根据用户输入更新它。在React中，可变状态通常保存在组件的state属性中，并且仅使用setState（）更新。

我们依据React状态是单一数据流这个原理将两者结合起来。呈现表单的React组件就可以控制在后续用户输入中该表单中发生的事情。以这种方式由React控制其值的输入表单元素称为“受控组件”。

```html
<input ref="inputTest" type="text" placeholder="测试" value={this.state.val}
onChange={this.inputValue}/>
```

``` js
inputValue(e){
    this.setState({
        val:e.target.value
    })
}
```

以上代码是react controlled组件的最简单的栗子。

在React中的事件，包括上面的`onChange`事件，都属于React的合成事件，也就是非浏览器的原生的，它是对浏览器原生事件的封装事件。react合成事件中，onChange事件类似于原生的input事件，只要按键就会触发，这在pc上面或者英文输入法中不会有任何问题，但是对于移动端输入时需要切换中文输入法或者其他不同输入法的其他语言的用户来说，会粗大事。比如上面这段最简单的代码，我们想要输入中文，比如"事件"，我们需要在手机键盘按键'shijian',每按一次键都会触发onChange事件，然后会发现输入框的内容已经输入了英文字母，这不是我们需要的结果。那怎么解决呢？我们可以通过`compositionEvent`事件。

### compositionEvent事件介绍

我们还是以输入中文为例，大家会发现，在移动设备中，中文的输入其实分为三个步骤（pc上其实也是一样），1:开始，2:敲键盘，3:点击选择中文。这个compositionEvent组合事件就是分拆了不同的步骤的事件的组合，这个组合事件是由compositionStart，compositionUpdate和compositionEnd三个事件的组合，Start和End事件只执行一次，Update会执行多次，只要没有选中中文之前，触发update事件，选中需要的选中的文字，就会触发end事件，一个组合事件完成，以此循环。

### 具体如何填坑

#### 1、使用uncontrolled 组件的方式，抛弃onChange事件

使用这种方式就基本上与pc浏览器的效果就一致了，请看如下代码，只添加了组合事件中End的监听，意味着若我们完成输入最后一步选中操作后，才会触发该监听。大家肯定会疑问，这不就是的onInput效果吗，那不就能够支持到controlled组件的方式，对不起，真不行，因为输入确实完美契合，但是删除操作，就无法触发这个监听了。所以，如果不加上onChange事件的配合，那就使用uncontrolled组件的方式吧。

``` html
<input ref="inputTest" type="text" placeholder="测试" 
              onCompositionEnd={this.handleComposition} />
```

#### 2、还是原来的controlled组件的配方，使用compositionEvent组合事件与onChange事件做兼容

上面已经提到controlled组件的解决方式了，那就是与onChange事件进行配合，那具体如何配合呢，请看代码如下：

``` html
<input ref="inputTest" type="text" placeholder="测试" 
              onCompositionStart={this.handlingComposition} 
              onCompositionUpdate={this.handlingComposition} 
              onCompositionEnd={this.handleComposition} 
              onChange={this.inputValue}/>
```

``` js
handlingComposition(){
    this.isCompositionEnd = false;
}
handleComposition(e){
    this.isCompositionEnd = true;
}
inputValue(e){
    if(this.isCompositionEnd){
        this.setState({
            val:e.target.value
        })
    }
}
```

以上代码会存在一点小问题，需要确保onCompositionEnd在onChange事件前触发，一旦有的浏览器存在兼容问题，两者的执行顺序相反，会导致onChange事件永不触发，因此，最好在handleComposition函数中重复执行一次onChange中的逻辑，避免出现兼容问题。

### 在没有框架的情况下，compositoin Event 与 oninput

经测试，再输入：

1. 汉字输入情况下，输入h。
2. 选择第一个汉字“好”

composition Event 与 `oninput`事件的发生顺序如下：

**Chrome: 5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36**

`compositionstart -> compositionupdate -> input -> compositionupdate -> input -> compositionend`

**Safari: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15**

`compositionstart -> compositionupdate -> input -> input -> input -> compositionend`

**Firefox: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:50.0) Gecko/20100101 Firefox/50.0"**

`compositionstart -> compositionupdate -> input -> compositionupdate -> compositionend -> input`

之后又测试了一下如下输入：

1. 汉字输入情况下，输入gao
2. 选择一个汉字。

Chrome和Firefox表现跟上述的触发顺序一样，Safari只有在最后决定选择输入的文字的时候，会连续触发3次 `input` 事件：

`compositionstart -> compositionupdate -> input - compositionupdate -> input -> compositionupdate -> input -> input -> input -> compositoinend`

## 在IOS上对表单元素输入限制时出现的问题

--转自[饿了么](https://zhuanlan.zhihu.com/p/26141351)

在 Web 开发中，经常要对表单元素的输入进行限制，比如说不允许输入特殊字符，标点。通常我们会监听 input 事件:

``` js
inputElement.addEventListener('input', function(event) {
  let regex = /[^1-9a-zA-Z]/g;
  event.target.value = event.target.value.replace(regex, '');
  event.returnValue = false
});
```

这段代码在 Android 上是没有问题的，但是在 iOS 中，input 事件会截断非直接输入，什么是非直接输入呢，在我们输入汉字的时候，比如说「喜茶」，中间过程中会输入拼音，每次输入一个字母都会触发 input 事件，然而在没有点选候选字或者点击「选定」按钮前，都属于非直接输入。

这显然不是我们想要的结果，我们希望在直接输入之后才触发 input 事件，这就需要引出我要说的两个事件—— compositionstart和compositionend。

compositionstart 事件在用户开始进行非直接输入的时候触发，而在非直接输入结束，也即用户点选候选词或者点击「选定」按钮之后，会触发 compositionend 事件。

``` js
var inputLock = false;
function doSomething(inputElement) {
    var regex = /[^1-9a-zA-Z]/g;
    inputElement.value = inputElement.value.replace(regex, '');
}

inputElement.addEventListener('compositionstart', function() {
  inputLock = true;
});


inputElement.addEventListener('compositionend', function(event) {
  inputLock = false;
  doSomething(event.target);
})


inputElement.addEventListener('input', function(event) {
  if (!inputLock) {
    doSomething(event.target);
    event.returnValue = false;
  }
});
```

添加一个 inputLock 变量，当用户未完成直接输入前，inputLock 为 true，不触发 input 事件中的逻辑，当用户完成有效输入之后，inputLock 设置为 false，触发 input 事件的逻辑。这里需要注意的一点是，compositionend 事件是在 input 事件后触发的，所以在 compositionend事件触发时，也要调用 input 事件处理逻辑。

## 参考

https://github.com/julytian/issues-blog/issues/15
https://github.com/w3c/uievents/issues/202
https://developer.mozilla.org/en-US/docs/Web/Events
https://juejin.im/post/5a3cccdb6fb9a04500034053
http://www.cnblogs.com/lhb25/archive/2012/11/30/oninput-and-onpropertychange-event-for-input.html
https://reactjs.org/docs/forms.html
https://www.cnblogs.com/llguanli/p/7340708.html