# 杂记

## 信号事件

一日看到如下代码：

``` js
['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
        // some code
        process.nextTick(() => {
            process.exit();
        });
    });
});
```

思考🤔为什么这么做？

通过网上查询，得知：

> 当 Node.js 进程接收到一个信号时，会触发信号事件 signal(7) 列出了标准POSIX的信号名称列表，例如 'SIGINT'、 'SIGHUP' 等等。

> 号处理程序将会接收信号的名称（'SIGINT'， 'SIGTERM' 等）作为第一个参数。

> 每个事件名称，以信号名称的大写表示 (比如事件 'SIGINT' 对应信号 SIGINT)。

这么说来上面的程序是注册了（监听）'SIGINT', 'SIGTERM'这两个信号事件，并且做了一些逻辑处理。

然后我们还看到像这样的信号还有很多，他们都属于 **signal(7)** 这个里面。