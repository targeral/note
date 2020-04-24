# performance

## other

[event: beforeunload]
[event: pagehide] 页面隐藏的时候会触发该事件。
||
[event: visibilitychange]（浏览器标签页被隐藏或显示的时候会触发visibilitychange事件）
||
[event: unload]
当文档或一个子资源正在被卸载时, 触发 unload事件。它在下面两个事件后被触发:

beforeunload (可取消默认行为的事件)
pagehide

[parse HTML]
    解析到app.fea47b49.css，并发送request
    解析到csdk，并发送request
    解析到app.fea47b49.js，并发送request

    执行js => 编译js
    执行js => 编译js => 获取bundle.min.js，发送请求

[Task] 接受app.fea47b49.css的相应

[event load]

[parse stylesheet] app.fea47b49.css

