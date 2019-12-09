# 内置类型

https://github.com/whxaxes/blog/issues/14
https://zhuanlan.zhihu.com/p/40311981

## typeof

一般我们都是先定义类型，再去赋值使用，但是使用 typeof 我们可以把使用顺序倒过来。

``` js
const options = {
  a: 1
}
type Options = typeof options
```

## 使用字符串字面量类型限制值为固定的字符串参数

限制 props.color 的值只可以是字符串 red、blue、yellow 。

``` js
interface IProps {
  color: 'red' | 'blue' | 'yellow',
}
```

同理，**使用数字字面量类型限制值为固定的数值参数**

``` js
interface IProps {
 index: 0 | 1 | 2,
}
```

## 使用 Partial 将所有的 props 属性都变为可选值

Partial 实现源码 node_modules/typescript/lib/lib.es5.d.ts

``` js
type Partial<T> = { [P in keyof T]?: T[P] };
```

上面代码的意思是 keyof T 拿到 T 所有属性名, 然后 in 进行遍历, 将值赋给 P , 最后 T[P] 取得相应属性的值，中间的 ? 用来进行设置为可选值。
如果 props 所有的属性值都是可选的我们可以借助 Partial 这样实现。

``` js
import { MouseEvent } from 'react'
import * as React from 'react'
interface IProps {
  color: 'red' | 'blue' | 'yellow',
  onClick (event: MouseEvent<HTMLDivElement>): void,
}
const Button: SFC<Partial<IProps>> = ({onClick, children, color}) => {
  return (
    <div onClick={onClick}>
      { children }
    </div>
  )
```

## 使用 Required 将所有 props 属性都设为必填项

Required 实现源码 node_modules/typescript/lib/lib.es5.d.ts 。

``` js
type Required<T> = { [P in keyof T]-?: T[P] };
```

看到这里，小伙伴们可能有些疑惑， -? 是做什么的，其实 -? 的功能就是把可选属性的 ? 去掉使该属性变成必选项，对应的还有 +? ，作用与 -? 相反，是把属性变为可选项。

## 条件类型
TypeScript2.8引入了条件类型，条件类型可以根据其他类型的特性做出类型的判断。

`T extends U ? X : Y`

原先:

``` js
interface Id { id: number, /* other fields */ }
interface Name { name: string, /* other fields */ }
declare function createLabel(id: number): Id;
declare function createLabel(name: string): Name;
declare function createLabel(name: string | number): Id | Name;
```

使用条件类型:

``` js
type IdOrName<T extends number | string> = T extends number ? Id : Name;
declare function createLabel<T extends number | string>(idOrName: T): T extends number ? Id : Name;
```

## Exclude<T,U>

从 T 中排除那些可以赋值给 U 的类型。

Exclude 实现源码 node_modules/typescript/lib/lib.es5.d.ts 。

``` js
type Exclude<T, U> = T extends U ? never : T;
```

例如：

``` js
type T = Exclude<1|2|3|4|5, 3|4>  // T = 1|2|5 
```

此时 T 类型的值只可以为 1 、2 、 5 ，当使用其他值是 TS 会进行错误提示。

`Error:(8, 5) TS2322: Type '3' is not assignable to type '1 | 2 | 5'.`

## Extract<T,U>

从 T 中提取那些可以赋值给 U 的类型。
Extract实现源码 node_modules/typescript/lib/lib.es5.d.ts。

``` js
type Extract<T, U> = T extends U ? T : never;
```

例如：

``` js
type T = Extract<1|2|3|4|5, 3|4>  // T = 3|4
```

## Pick<T,K>

从 T 中取出一系列 K 的属性。
Pick 实现源码 node_modules/typescript/lib/lib.es5.d.ts。

``` js
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

假如我们现在有一个类型其拥有 name 、 age 、 sex 属性，当我们想生成一个新的类型只支持 name 、age 时可以像下面这样：

``` js
interface Person {
  name: string,
  age: number,
  sex: string,
}
let person: Pick<Person, 'name' | 'age'> = {
  name: '小王',
  age: 21,
}
```

## Record<K,T>

将 K 中所有的属性的值转化为 T 类型。
Record 实现源码 node_modules/typescript/lib/lib.es5.d.ts。

``` js
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

将 name 、 age 属性全部设为 string 类型。

``` js
let person: Record<'name' | 'age', string> = {
  name: '小王',
  age: '12',
}
```

## Omit<T,K>（没有内置）

从对象 T 中排除 key 是 K 的属性。
由于 TS 中没有内置，所以需要我们使用 Pick 和 Exclude 进行实现。

``` js
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
```

排除 name 属性。

``` js
interface Person {
  name: string,
  age: number,
  sex: string,
}
let person: Omit<Person, 'name'> = {
  age: 1,
  sex: '男'
}
```

## NonNullable <T>

排除 T 为 null 、undefined。
NonNullable 实现源码 node_modules/typescript/lib/lib.es5.d.ts。

``` js
type NonNullable<T> = T extends null | undefined ? never : T;
```

实例：

``` js
type T = NonNullable<string | string[] | null | undefined>; // string | string[]
```

## ReturnType<T>

获取函数 T 返回值的类型。。
ReturnType 实现源码 node_modules/typescript/lib/lib.es5.d.ts。

``` js
type ReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : any;
```

infer R 相当于声明一个变量，接收传入函数的返回值类型。

例如：

``` js
type T1 = ReturnType<() => string>; // string
type T2 = ReturnType<(s: string) => void>; // void
```