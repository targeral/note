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

具体可以查看下面链接，对于不同的事件（部分），我们可以做一些逻辑处理。

[参考链接](http://nodejs.cn/api/process/signal_events.html)

### 延伸

#### SIGINT、SIGQUIT、 SIGTERM、SIGSTOP区别

SIGINT

程序终止(interrupt)信号, 在用户键入INTR字符(通常是Ctrl-C)时发出，用于通知前台进程组终止进程。


SIGQUIT

和SIGINT类似, 但由QUIT字符(通常是Ctrl-\)来控制. 进程在因收到SIGQUIT退出时会产生core文件, 在这个意义上类似于一个程序错误信号。


SIGTERM

程序结束(terminate)信号, 与SIGKILL不同的是该信号可以被阻塞和处理。通常用来要求程序自己正常退出，shell命令kill缺省产生这个信号。如果进程终止不了，我们才会尝试SIGKILL。


停止(stopped)进程的执行. 注意它和terminate以及interrupt的区别:该进程还未结束, 只是暂停执行. 本信号不能被阻塞, 处理或忽略.
