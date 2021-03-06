# State

## 前端需要状态嘛？

需要。每个组件都是有自己的状态。可以把单个组件的状态理解为是此刻的组件数据、组件状态、数据模型实例。但是由于每个状态与每个组件是一一对应的，并且他们各自存在于组件内部。所以一旦我们从某个组件的视角出来，就发现难以再去获取或者操作那个组件的状态。所以每个组件里的状态，他们像是孤岛一样，各自控制着自己内部的变化。

## 孤岛状态如何连接在一起，让他们不再孤单

如果把组件整体比作一个生物的话，那么组件的状态可以被认为是灵魂吧。有句话说的好：

*好看的皮囊千篇一律,有趣的灵魂万里挑一*

也有这样的说法：如果一个人死了，他的灵魂还会再去转世重生。2333。

当然这里我其实想说，组件的状态就像是灵魂，他可以换不同的躯体，也就是template。如果我们希望让这些灵魂不在孤单，最起码需要把它们放在一起，这样它们才能互相看到不是？

所以状态是需要管理的，而最基本的管理，就是把它们放在一起。

## 灵魂的基本能力

既然作为灵魂，它们就应该有一些能力。

对于一个需求、功能、抽象的组件，最基本的我们可以把其数据模型抽像出来。它的形态也就是一个纯对象的模式。他们没有任何其他特效，只能被“认领”和“被看”。

``` js
{
    a: 1,
    b: 2,
    c: {
        d: 3
    }
}
```

然而灵魂应该有一些神奇的能力。

我们可以给状态添加一些功能，让他们更强大。

### 观察能力

当我们的页面有很多个状态对象的时候，比如A、B、C。并且这些状态有不同的属性，例如：

``` js
const A = {
    a1,
    a2,
};
const B = {
    b1,
    b2,
};
const C = {
    c1,
    c2,
    c3,
};
```

如果在 A.a1 属性变化的时候，需要 B.b1、C.c1、C.c2 属性也随之变化，这个时候就需要一种机制来观察或者说监听某个状态下的属性（子状态）的变化。

一般来这样的逻辑的实现有两种：

一种是命令式的编写方式，以下是伪代码

``` js
if (A.a1 !== A.preA1) {
    doAboutBb1Something(A.a1);
    doAboutCc1Something(A.a1);
    doAboutCc2Something(A.a1);
}
```

另一种是基于观察者模式：

``` js
//// in B State
import A from 'A';

// dosomething...
A.observe.a1((a1) => {
    doAboutBb1Something(a1);
});
// dosomething...

//// in B State

//// in C State
import A from 'A';

// dosomething...
A.observe.a1((a1) => {
    doAboutCc1Something(a1);
    doAboutCc2Something(a1);
});
// dosomething...

//// in C State
```

说实话，我更新换观察者模式。不过无论哪种方式，当具有了观察能力的时候，就可以更简单的去更新的自己状态或者做一些其他的事情（除了更新状态还有什么呢？）。

## 多State的管理（组合OR继承OR？？？）

初步感觉组合大于继承吧。

## 与View层的交互逻辑

### 自上而下的单向数据流

从这个标题来看，这个跟redux貌似没啥区别。不过redux，是同一个不可变对象。（虽然印象里好像也可以是多个）同时他需要调用redux的方法来更新状态。而我们这里的方法是：

调用各自State的自身方法，更新所有与其相关状态，然后生成一个新的`State`，通过根组件的props传递下去。也就是说他调用的更新方法是自身State的方法，更具有语义性，更加贴心业务以及更加内敛于组件。

### 基于observe（观察者模式）的数据流

另一种每个组件的state的完全隔离，只通过observer这种数据流的模式进行状态变更。（这种貌似就是用rxjs+react吧）。
