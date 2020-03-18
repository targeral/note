# About Babel Plugins

Babel是一个编译器，从宏观角度看，它将代码分为三个阶段：**解析**、**转换**、**生成**（与其他编辑器相同）。

在初始阶段，Babel没有做任何事请，它基本上就相当于`const babel = code => code;`，先解析代码，然后再生成相同的代码。然而你可以为Babel添加一些插件让其做任何事情，这也就是所谓的第二个阶段——转换。

## 关于编译器

大多数编译器分为三个基本的阶段：Parsing（解析），Transformation（转换）和Code Generation（代码生成）。

1. Parsing是将原始代码转化为更加抽象的代码表示形式。
2. Transformation是将这种抽象的表示和操作变为complier所想要的形式。
3. Code Generation将转化过形式的代码变为新的代码。

### Parsing

Parsing一般被分解为两个部分：词法分析和语法分析。

词法分析将使用原始的代码，通过tokenizer（词法分析器）把代码分解为许多个叫做tokens的东西。

Tokens是一组简单的对象，其用来描述一个单独的语法片段。它们可能是数字，标签，标单符号，操作符等等。

语法分析使用这些token，将它们重新格式化它们为一种“描述语法的每一个部分以及其相互关系”的表达形势。这就是所谓的 **Intermediate Representation （中间表示）**或**Abstract Syntax Tree（抽象语法树）**

抽象语法树简称为AST，是以一种使用简单并且能够反映很多信息的深度嵌套的对象。

例如下面的语法：

``` sh
(add 2 (subtract 4 2))
```

上面的语法分解出来的token像是这样：

``` sh
[
  { type: 'paren',  value: '('        },
  { type: 'name',   value: 'add'      },
  { type: 'number', value: '2'        },
  { type: 'paren',  value: '('        },
  { type: 'name',   value: 'subtract' },
  { type: 'number', value: '4'        },
  { type: 'number', value: '2'        },
  { type: 'paren',  value: ')'        },
  { type: 'paren',  value: ')'        },
]
```

由此转为AST像是这样：

``` sh
{
  type: 'Program',
  body: [{
    type: 'CallExpression',
    name: 'add',
    params: [{
      type: 'NumberLiteral',
      value: '2',
    }, {
      type: 'CallExpression',
      name: 'subtract',
      params: [{
        type: 'NumberLiteral',
        value: '4',
      }, {
        type: 'NumberLiteral',
        value: '2',
      }]
    }]
  }]
}
```

### 转换

编译器的下个阶段就是转换。这次使用上一个步骤产生的AST，将它进行改变。可以使用相同的语言来操作AST或者将它翻译成全新的语言。

让我们看一下如何转换：

你可能注意到我们的AST的一些元素长的非常相似。他们都有一个type属性，他们都是一个AST节点。这些节点定义了一些属性用于描述树的一部分独立的属性。

比如下面是一个“NumberLiteral"节点：

``` js
{
  type: 'NumberLiteral',
  value: '2'
}
```

或者也可能是一个'CallExpression'节点：

``` js
{
  type: 'CallExpression',
  name: 'subtract',
  params: [
    // nested nodes go here...
  ],
}
```

当在转换一个AST的时候，我们可以通过添加、删除、替换属性的方式操作节点，我们可以添加新的节点，删除节点，或者我们单独保留现在的ast并基于它创建新的节点。

由于我们的目标是一种全新的语言，所以我们将要关注与创建一种特定于目标语言的全新的AST。

### 遍历

为了浏览所有的节点，我们需要能够遍历他们。这个遍历过程使用了深度优先遍历每一个节点。

``` js
{
  type: 'Program',
  body: [{
    type: 'CallExpression',
    name: 'add',
    params: [{
      type: 'NumberLiteral',
      value: '2'
    }, {
      type: 'CallExpression',
      name: 'subtract',
      params: [{
        type: 'NumberLiteral',
        value: '4'
      }, {
        type: 'NumberLiteral',
        value: '2'
      }]
    }]
  }]
}
```

因此对于上面的AST，我们将会：

1. Program - 从AST的最顶级位置开始
2. CallExpression (add) - 移动到Program的body里第一个元素处。
3. NumberLiteral (2) - 移动到CallExpression的参数的第一个元素处。
4. CallExpression (subtrcat) - 移动到CallExpression的参数的第二个元素处。
5. NumberLiteral (4) - 移动到CallExpression的参数的第一个元素处。
6. NumberLiteral (2) - 移动到CallExpression的参数的第二个元素处。

如果我们直接操纵这个ast，而不是创建一个单独的ast，我们可能会在这里引入各种抽象。但只要访问树中的每个节点就足够了。

我使用“访问”这个词的原因是因为这种模式表示如何在对象结构的元素上表示操作。

#### Visitors

这里的基本思想是我们将创建一个“访问者”对象，该对象具有接受不同节点类型的方法。

``` js
var visitor = {
  NumberLiteral() {},
  CallExpression() {},
};
```

当我们遍历我们的ast时，只要我们输入一个匹配类型的节点，我们就会调用这个访问者的方法。

为了使这个功能更加有用，我们还将传递节点和对父节点的引用。

``` js
var visitor = {
  NumberLiteral(node, parent) {},
  CallExpression(node, parent) {}
}
```

但是，也有可能在“退出”中调用它们。以列表的形式想象我们的树结构：

* Program
  * CallExpression
    * NumberLiteral
    * CallExpression
      * NumberLiteral
      * NumberLiteral

当我们往下走时，我们会到达分支的末端，当我们完成树的每个分支的遍历时，我们“退出”它。所以整体的情况是：沿着树进入每个节点，然后回到“退出”。

* → Program (enter)
  * → CallExpression (enter)
    * → NumberLiteral (enter)
    * ← NumberLiteral (exit)
    * → CallExpression (enter)
      * → NumberLiteral (enter)
      * ← NumberLiteral (exit)
      * → NumberLiteral (enter)
      * ← NumberLiteral (exit)
    * ← CallExpression (exit)
  * ← CallExpression (exit)
* ← Program (exit)

基于上面的思路，最后我们的visitor函数看起来像这样：

``` js
var visitor = {
  NumberLiteral: {
    enter(node, parent) {},
    exit(node, parent) {}
  }
};
```

### 代码生成

编译器的最后部分就是代码生成。有时编译器会做与重构相重叠的事情，但大部分代码生成只是意味着将我们的ast和string-ify代码退出。

代码生成器以几种不同的方式工作，一些编译器将重用先前的token，其他编译器将创建代码的单独表示，以便它们可以线性地打印节点，但是从我可以告诉的最多的将使用与我们刚刚创建的相同，这是我们将要关注的。

我们的代码生成将会知道如何高效的打印出具有不同节点类型的AST，它会递归地调用它自己来打印嵌套节点，直到将所有内容打印成一长串代码。

[原文](https://the-super-tiny-compiler.glitch.me/)
[Babel官方文档](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#toc-introduction)

## 如何创建一个Babel插件

因为Babel并没有做什么主要的工作，主要的转换工作都是靠各种插件来完成的。所以对于插件的工作原理的理解十分重要。

Babel实际上是一组模块的集合。它有如下模块：

* babylon
* babel-traverse
* babel-types
* babel-generator

### babylon

Babylon 是 Babel 的解析器。可以将我们的代码解析为ast。

### babel-traverse

Babel Traverse（遍历）模块维护了整棵树的状态，并且负责替换、移除和添加节点。

### babel-types

Babel Types模块是一个用于 AST 节点的 Lodash 式工具库（译注：Lodash 是一个 JavaScript 函数工具库，提供了基于函数式编程风格的众多工具函数）， 它包含了构造、验证以及变换 AST 节点的方法。 该工具库包含考虑周到的工具方法，对编写处理AST逻辑非常有用。

### babel-generator

Babel Generator模块是 Babel 的代码生成器，它读取AST并将其转换为代码和源码映射（sourcemaps）。

参考：https://github.com/jamiebuilds/babel-handbook