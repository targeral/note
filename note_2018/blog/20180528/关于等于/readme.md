---
title: 关于JavaScript中的等于
date: 2018/05/28
categories: javascript
tags: [javascript]
---

# 关于JavaScript中的抽象相等比较与不等关系

## 两种等于

在JavaScript中存在两种等于，一种是双等号“==”的抽象相等比较，又叫做“不严格相等”。另一个则是三等号“===”的严格相等比较。对应这两种相等，还有两种“不等”版本，分别是“!=”和“!==”，它们分别叫做“不等关系”和“不相等”，这两者不要搞混，虽然这里我们不去重点讨论。

## 两种等于的区别

“==”和“===”的区别在于，“==”检查值相等，而“===”检查值和类型相等。

我们要知道在JavaScript中，变量（`var`、`let`、`const`）是没有类型的，而值是有类型的。虽然说“==”和“===”的区别在于是否检查值的类型，但是这么说其实是不精确的。更正确的说法是，“==”检查的是允许类型转换情况下的值的相等，而“===”检查的是不允许类型转换的情况下的值的相等性，因此“===”经常被称为“严格等于”。

由于“==”的“不严格相等”允许隐式的类型转换，所以在使用时会产生由此带来的“副作用”。而这种副作用使得开发者认为“===”更可预测、更加正确，所以他们支持一直使用“===”而避免使用“==”。在我入职之前也是这样认为“更多的使用===，避免使用==”。而工作中，发现代码中经常是“==”，对此感到不解和鄙视。

不过深入研究后，更多的感觉是对于这两者没有深入的理解。这两者之间没有谁更加好，而是视情况而定使用。

### 关于抽象相等的规则

“==”是一个强大的工具，对其规则深入了解，对程序是很有益处的而不是避开他不使用。

抽象相等比较的算法：

在这里之前，先说一下其中需要用到的方法：

**ToNumber**

抽象操作`ToNumber`会将参数转换为数值类型的值，转换规则如下：

* Undefined => NaN
* Null => +0
* Boolean => if value is `true`, then result is 1, otherwise value is 0.
* Number => 返回与输入相同的值
* String => 参考[ecma](http://www.ecma-international.org/ecma-262/5.1/#sec-9.3.1)
* Object => 首先调用ToPrimitive(input argument, hint Number)赋值给primValue，再调用ToNumber(primValue)返回结果

**ToPrimitive(input [ , PreferredType ])**

抽象操作 ToPrimitive 接受一个 input 参数和一个可选的 PreferredType 参数。ToPrimitive 负责把 input 参数转换为一个非对象类型。如果一个对象可以转换为多个原始类型，则应该根据可选提示 PreferredType 来判断转换的类型。根据以下算法进行转换：

如果input是一个对象类型，那么：

* 如果`PreferredType`不存在，则hint为“default”
* 如果`PreferredType`是字符串类型，则hint为“string”
* 如果`PreferredType`是数值类型，则hint为“number”
* 如果hint为“default”，则设置hint为“number”
* 返回调用OrdinaryToPrimitive(input, hint)的值

**OrdinaryToPrimitive ( O, hint )**

当使用参数 O 和 hint 调用抽象操作 OrdinaryToPrimitive 时，执行以下步骤：

* 判断参数O是不是对象类型
* 判断参数hint是不是字符串并且其值是不是“string”和“number”两者其一
* 如果hint是“string"，那么依次调用`toString`和`valueOf`方法
* 否则依次调用`valueOf`和`toString`


比较x和y两个值，返回`true`或`false`，比较规则如下：

1. 如果x和y是一样的的，那么
    * 如果x是`Undefined`类型，则返回`true`
    * 如果x是`Null`类型，则返回`true`
    * 如果x是`Number`类型，那么
        - 如果x是`NaN`，则返回`false`
        - 如果y是`NaN`，则返回`false`
        - 如果x是和y一样的数值，则返回`true`
        - 如果x是`+0`并且y是`-0`，则返回`true`
        - 如果x是`-0`并且y是`+0`，则返回`true`
        - 其他情况返回false
    * 如果x是字符串类型，然后如果x和y是完全相同的字符序列（相同的长度和相同的字符在相应的位置），那么返回`true`
    * 如果x是布尔值类型，那么如果x和y都是`true`或者`false`时，返回`true`
    * 如果x和y都引用相同的对象，则返回`true`
2. 如果x是`null`，y是`undefined`，则返回`true`
3. 如果y是`null`，x是`undefined`，则返回`true`
4. 如果x是数值类型并且y是字符串类型，则返回的是x与调用了`ToNumber`方法的y值的比较结果，简单的表示就是： `x == ToNumber(y)`
5. 如果y是数值类型并且x是字符串类型，则返回的是y与调用了`ToNumber`方法的x值的比较结果，简单的表示就是： `y == ToNumber(x)`
6. 如果x是布尔类型，则返回的结果为`ToNumber(x) == y`的比较结果
7. 如果y是布尔类型，则返回的结果为`ToNumber(y) == x`的比较结果
8. 如果x是字符串类型或者数值类型，y是对象类型，则返回`ToPrimitive(y) == x`的比较结果
9. 如果y是字符串类型或者数值类型，x是对象类型，则返回`ToPrimitive(x) == y`的比较结果
10. 其他情况，返回false

**NOTE 1**

根据上面的规则：
* 字符串比较可以通过` "" + a == "" + b`方式来强制转换
* 数值比较可以通过`+a == +b`方式来强制转换
* 布尔类型可以通过`!a == !b`方式来强制转换

**NOTE 2**

以下的相等运算符是等效的：

* `A != B`等价于`!(A == B)`
* `A == B`等价于`B==A`

**NOTE 3**

相等运算符并不总是具有可传递性的。例如两个不同的字符串对象，每一个代表的值都等于一个相同的字符串值，这样每一个字符串对象与该字符串值使用“==”都会返回`true`，但是两个字符串对象并不相同。例如：

* `new String("a") == "a"`和`"a" == new String("a")`两个表达式都为`true`.
* 但是`new String("a") == new String("a")`这个表达式返回的结果是`false`.

**NOTE 4**

字符串比较使用对代码单元值序列的简单相等性测试，没有试图使用Unicode规范中定义的更复杂，面向语义的字符或字符串相等性和整理顺序的定义。因此，根据Unicode标准规范相等的字符串值可能会测试为不相等，实际上，该算法假定两个字符串都已经处于标准化形式。

## 不等关系

运算符>、<、>=、<=用于表示不等关系，在规范中被称为“关系比较”。其类型转换规则与"=="规则类似（尽管是不完全相同）。