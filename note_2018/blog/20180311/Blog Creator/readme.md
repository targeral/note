# Blog Creator

## About Blog Creator

`Blog Creator`是一个创建了以时间(格式为YYYYMMDD)为文件名并且在其子目录创建了以Blog名字为文件名以及在此文件夹下创建的一个`readme.md`文件。

目录格式为：

- YYYYMMDD
    - BlogName
        - readme.md

目的就是将避免做重复的事情，通过执行node命令来初始化blog。
## Aims

目前的目标就是通过在blog项目里，通过执行`node index.js`来初始化一个blog。

1. 如果没有当前时间的文件夹，就创建；否则就在此文件夹下创建blog内容。
2. 创建时间文件夹后，开始通过对话进行询问blog的名字。如果已存在同名的blog，则提示已经存在这样的文件夹；否则创建相应的文件夹并在此文件夹下创建`readme.md`文件。
3. 在`readme.md`文件里初始化内容，写入`# ${BlogName}`

## 实现

### 获取日期

首先获得今天的时间，并且格式化为`YYYYMMDD`。虽然有很多Javascript日期处理类库，但是这样的小需求还是自己来实现吧。

获取日期相关信息肯定要通过Date对象来获取。

我们先通过实例化一个Date对象分别获取年份、月份、日期的信息，其中要注意月份的信息，通过`getMonth()`获取的月份信息是从0到11，所以对应到我们这里的月份信息要`+1`。类似这种时间对不上的还有:

* `getDay()`: 根据本地时间，返回一个具体日期中一周的第几天，0表示星期天，1表示星期一。（ps：这个跟getDate()长的很像，但是前者是返回一周的第几天，而后者是这个月的第几天并且没有这种问题）
* `getUTCDay()`: 以世界时为标准，返回一个指定的日期对象为一星期中的第几天，其中 0 代表星期天，1表示星期一。

获取年月日的信息之后，我们就要开始对其进行格式化。我们的要求是YYYYMMDD，年份的信息是符合我们的要求而其他两个则有一个相同的问题：当数字小于10的时候会显示`MD`而不是`MMDD`，例如一月一号如果不处理会得到`11`，而我们要的是`0101`。所以我们需要对其进行格式化，实现很简单：判断一下然后使用字符串模板就可以了。

最后通过字符串模板返回格式化的时间。代码如下：

**initDateFolderName.js**
``` javascript
const initDateFolderName = () => {
    const date = new Date()
    const year = date.getFullYear()
    const _month = date.getMonth() + 1
    const _day = date.getDate()
    const month = _month > 10 ? _month : `0${_month}`
    const day = _day > 10 ? _day : `0${_day}`

    return `${year}${month}${day}`
}

module.exports = initDateFolderName
```

### 初始化日期文件夹

得到格式化的日期，我们就可以用它来创建相应的文件夹：

这里使用到了nodejs的文件系统——fs模块，fs模块提供了类似标准POSIX函数的API。这里我们要做两件事，一件是判断日期文件夹是否存在，另一件事在日期文件夹不存在的时候创建它。

这里使用`fs.existsSync(path)`来判断path路径存不存在，如果存在返回`true`，否则返回`false`。它是一个同步函数，与其对应的是一个叫做`fs.exists()`的异步函数，但是这个函数nodejs已经弃用了。

然后当日期文件不存在的时候，我们通过`fs.mkdirSync`来创建这个文件夹。你会发现这个函数的结尾后面也有`Sync`，所以它也是一个同步函数。这里使用`fs.mkdirSync(path[, mode])`来创建日期文件夹。

最后我们将带有项目根目录的文件夹名返回出去。代码如下：

**initDateFolder.js**
``` javascript
const fs = require('fs')

const initDateFolder = (dateFolderName) => {
    const BLOG = 'blog'
    const dateFolder = `${BLOG}/${dateFolderName}`
    !fs.existsSync(dateFolder) && fs.mkdirSync(dateFolder)
    return dateFolder
}

module.exports = initDateFolder
```

### 初始化Blog

接下来我们要开始初始化我们的blog了。创建Blog文件夹之前，我们要先询问Blog的名字。

如何实现这种在终端的交互呢？可以通过NodeJS的`Readline`模块。Readline是Node.js里实现标准输入输出的封装好的模块，通过这个模块我们可以以逐行的方式读取数据流。这和我们大学里学习C++的标准输入类似。这里我们把这个功能再做了一小点的封装。

要使用Readline模块，首先要引入此模块，并且通过`createInterface(options)`创建readline接口实例，使用了`process.stdin`和`process.stdout`来作为readline实例数据的输入输出流；创建完实例rl，我们就可以`rl.question(query, callback)`方法将我们要询问的信息输出到终端上，并且当我们在终端输入内容之后，可以通过`callback`获取内容，其中参数`query`是一段陈述或者询问（其实什么内容都行），rl通过`output`将其输出到终端并等待用户输入，然后通过用户输入结束触发`callback`函数，其参数为用户输入的内容。

这里面的Log模块是`console.log`的封装。代码如下：


**Rl.js**
```javascript
const readline = require('readline')
const Log = require('./Log')

const Rl = (question, answerPrfix = '') => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve, reject) => {
        rl.question(question, answer => {
            Log(`${answerPrfix}${answer}`)
            rl.close()
            resolve(answer)
        })
    })
}

module.exports = Rl
```

当我们准备好`Rl.js`文件后，就开始撸，哦不，写我们主要的逻辑啦。

首先准备我们的询问语句，然后调用Rl函数获取`blogName`，再然后判断该blog文件夹是否存在，如果存在则告诉用户此文件夹已存在，否则就创建blogName文件夹和`readme.md`文件

创建`readme.md`文件也很简单，使用`fs.mkdirSync(file)`方法。最后使用`fs.writeFileSync()`方法写入内容。代码如下：

**initBlog.js**
``` javascript
const fs = require('fs')
const Rl = require('./Rl')
const Log = require('./Log')
let {
    isUndefined, 
    isFalse
} = require('./utils')

const createBlog = (dir, blogName) => {
    const blogFile = `${dir}/readme.md`
    const blogContent = `# ${blogName}`

    fs.mkdirSync(dir)
    fs.writeFileSync(blogFile, blogContent)
}

const initBlog = async (dir) => {
    const YOUR_BLOG_NAME = 'Your blog`s name is? '
    const INIT_YOUR_BLOG = 'Init blog folder —— '
    const BLOG_FOLDER_EXIST = 'The folder is existed'
    const blogName = await Rl(YOUR_BLOG_NAME, INIT_YOUR_BLOG)
    const blogFolderName = `${dir}/${blogName}`
    const isExist = fs.existsSync(blogFolderName) && Log(BLOG_FOLDER_EXIST)
    !isUndefined(isExist) && isFalse(isExist) && createBlog(blogFolderName, blogName)
}

module.exports = initBlog

```
