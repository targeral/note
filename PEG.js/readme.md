# PEG.js

## 语法和语义

语法和js一样 都不是注重行和无视空格的。你可以使用Javascript风格的注释（// ... 和 /* ... */）。

让我们看一下例子——识别2 *（3 + 4）之类简单算术表达式。从此语法生成的解析器将计算其值

``` 
start
  = additive

additive
  = left:multiplicative "+" right:additive { return left + right; }
  / multiplicative

multiplicative
  = left:primary "*" right:multiplicative { return left * right; }
  / primary

primary
  = integer
  / "(" additive:additive ")" { return additive; }

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }
```

首先，该语法由规则组成（在我们的示例中，规则有五个）。
每个规则都有一个标识该规则的名称（例如整数）和一个解析表达式（例如digits：[0-9] + {return parseInt（digits.join（“”），10）;}）定义了一个模式来匹配输入文本，并且可能包含一些JavaScript代码，这些代码确定模式成功匹配后会发生什么。规则还可以包含错误消息中使用的易于理解的名称（在我们的示例中，只有*interger*规则具有易于理解的名称 "integer"）。解析从第一个规则开始，也称为开始规则。

规则的名称必须是JavaScript标识符。其后跟一个等号（“ =”）和一个解析表达式。如果规则具有易于理解的名称，那么它将作为JavaScript字符串写在名称和分隔的等号之间。规则仅需用空格分隔（它们的开头很容易辨认），但在解析表达式之后可以使用分号（“;”）。

第一个规则之前可以带有一个初始化程序-在一对大括号（“ {”和“}”）中的一段JavaScript代码(见@1)。在生成的解析器开始解析之前，将执行此代码。可以在规则操作和语义谓词中访问初始化程序中定义的所有变量和函数。初始化程序中的代码可以使用 `options` 变量访问传递给解析器的选项。初始化代码中的花括号必须保持平衡。(?)
让我们使用简单的初始化程序从上方看示例语法。

```
// @1-start 此处不存在代码中，一下也是如此
{
  function makeInteger(o) {
    return parseInt(o.join(""), 10);
  }
}
// @1-end

start
  = additive

additive
  = left:multiplicative "+" right:additive { return left + right; }
  / multiplicative

multiplicative
  = left:primary "*" right:multiplicative { return left * right; }
  / primary

primary
  = integer
  / "(" additive:additive ")" { return additive; }

integer "integer"
  = digits:[0-9]+ { return makeInteger(digits); }
```

规则的解析表达式用于将输入文本与语法进行匹配。表达式有多种类型-匹配的字符或字符类，指示可选部分和重复等。表达式还可以包含对其他规则的引用。

如果表达式在运行生成的解析器时成功匹配文本的一部分，则它将生成匹配结果，该结果是JavaScript值。例如：

* 匹配字面字符串的表达式时将生成包含匹配文本的JavaScript字符串。
* 与某个子表达式的重复出现匹配的表达式将生成具有所有匹配项的JavaScript数组。

在表达式中使用规则名称时，匹配结果会通过规则传播，直到起始规则为止。解析成功后，生成的解析器将返回起始规则的匹配结果。

解析器表达式的一种特殊情况是 *parser action* ——大括号（“ {”和“}”）中的一段JavaScript代码，该字符串获取前面某些表达式的匹配结果并返回JavaScript值。
该值被视为先前表达式的匹配结果（换句话说，*parser action*是匹配结果转换器）。

在我们的算术示例中，有许多解析器动作。考虑表达式数字中的操作：[0-9]+ {return parseInt（digits.join（“”），10）;}。
它以表达式 `[0-9]+` 的匹配结果作为参数，该结果是一个包含数字的字符串数组。它将数字连接在一起形成字符串再转换为数值。

## 解析表达式类型

解析表达式有几种类型，其中一些包含子表达式，因此形成递归结构：

### 1. `"literal"` 或者 `'literal'`

匹配确切的文字字符串并返回它。字符串语法与JavaScript中的相同。在文字后立即添加i会使匹配不区分大小写。

### 2 `.`

精确匹配一个字符并将其作为字符串返回。

### 3. `[characters]`

匹配一组字符，并将其作为字符串返回。可以使用与JavaScript字符串完全相同的方式对列表中的字符进行转义。字符列表还可以包含范围（例如[a-z]表示“所有小写字母”）。在字符前面加上^会反转匹配的集合（例如[^ a-z]表示“除小写字母外的所有字符”）。在表达式后立即添加i会使匹配不区分大小写。

### 4. rule

递归匹配规则的解析表达式并返回其匹配结果。

### 5. ( expression )

匹配子表达式并返回其匹配结果。

### 6. expression *

匹配表达式的零个或多个重复，并在数组中返回其匹配结果。匹配是贪婪的，即解析器尝试尽可能多地匹配表达式。与正则表达式不同，没有回溯。

### 7. expression +

匹配表达式的一个或多个重复，然后将其匹配结果返回到数组中。匹配是贪婪的，即解析器尝试尽可能多地匹配表达式。与正则表达式不同，没有回溯。

### 8. expression ?

尝试匹配表达式。如果匹配成功，则返回其匹配结果，否则返回null。与正则表达式不同，没有回溯。

### & expression

尝试匹配表达式。如果匹配成功，则返回 `undefined` 并且不消耗任何输入，否则认为匹配失败。

### ! expression

尝试匹配表达式。如果匹配失败，则返回 `undefined` 并且不消耗任何输入，否则认为匹配失败。

### & { predicate }

谓词是一段JavaScript代码，就像在函数内部一样执行。它获取前一个表达式中带标签的表达式（带标签的表达式？）的匹配结果作为其参数。它应该使用return语句返回一些JavaScript值。如果返回值在布尔值上下文中为true，则只需返回undefined且不消耗任何输入即可；否则认为匹配失败。

谓词中的代码可以访问语法开头在初始化程序中定义的所有变量和函数。谓词内部的代码也可以使用 `location`函数访问位置信息。它返回这样的对象：

``` js
{
  start: { offset: 23, line: 5, column: 6 },
  end:   { offset: 23, line: 5, column: 6 }
}
```

开始和结束属性均引用当前的解析位置。offset属性包含作为从零开始的索引的偏移量，而line和column属性包含作为从一开始的索引的行和列。

谓词中的代码还可以使用options变量访问传递给解析器的选项。

请注意，谓词代码中的花括号必须保持成对出现。

### ! { predicate }

谓词是一段JavaScript代码，就像在函数内部一样执行。它获取前一个表达式中带标签的表达式的匹配结果作为其参数。它应该使用return语句返回一些JavaScript值。
如果返回值在布尔上下文中为false，则仅返回undefined并且不消耗任何输入；否则认为匹配失败。

谓词中的代码可以访问语法开头在初始化程序中定义的所有变量和函数。

谓词内部的代码也可以使用定位功能访问位置信息。它返回这样的对象：

``` js
{
  start: { offset: 23, line: 5, column: 6 },
  end:   { offset: 23, line: 5, column: 6 }
}
```

开始和结束属性均引用当前的解析位置。offset属性包含作为从零开始的索引的偏移量，而line和column属性包含作为从一开始的索引的行和列。

谓词中的代码还可以使用options变量访问传递给解析器的选项。

请注意，谓词代码中的花括号必须保持平衡。

### $ expression

尝试匹配表达式。如果匹配成功，则返回匹配的文本而不是匹配结果。

### lable: expression

匹配表达式并记住给定标签下的匹配结果。标签必须是JavaScript标识符。带标签的表达式与解析器转换器（`parser action`）一起使用时很有用，可以通过 action 的JavaScript代码访问保存的匹配结果。

### expression1 expression2 ... expressionn

匹配一系列表达式，然后将它们的匹配结果返回到数组中。

### expression { action }

匹配表达式。如果匹配成功，请执行 action，否则认为匹配失败。

该 action 是一段JavaScript代码，就像在函数内部一样执行。它可以获取前一个表达式中带标签的表达式的匹配结果作为其参数。该 action 应使用return语句返回一些JavaScript值。该值被认为是前一个表达式的匹配结果。

为了指示错误，action 中的代码可以调用 `expected` 的函数，该函数会使解析器引发异常。该函数有两个参数-当前位置的期望描述和可选的位置信息（默认为返回的 `location`-见下文）。该描述将用作引发异常消息的一部分。

action中的代码也可以调用 `error` 函数，这也使解析器引发异常。该函数带有两个参数-错误消息和可选的位置信息（默认为返回的 `location`-见下文）。该消息将被用于抛出的异常使用。

action内部的代码可以访问语法开头在初始化程序中定义的所有变量和函数。

action代码中的花括号必须保持成对出现。

action中的代码也可以使用 `text` 函数访问与表达式匹配的文本。

action中的代码也可以使用 `location` 函数访问位置信息。它返回这样的对象：

``` js
{
  start: { offset: 23, line: 5, column: 6 },
  end:   { offset: 25, line: 5, column: 8 }
}
```

start属性是指表达式开始处的位置，end属性是指表达式结束后的位置。offset属性包含作为从零开始的索引的偏移量，而line和column属性包含作为从一开始的索引的行和列。

action中的代码还可以使用options变量访问传递给解析器的选项。

请注意，动作代码中的花括号必须保持平衡。

### expression1 / expression2 / ... / expressionn

尝试匹配第一个表达式，如果不成功，请尝试第二个，以此类推。返回第一个成功匹配的表达式的匹配结果。如果没有表达式匹配，则认为匹配失败。

