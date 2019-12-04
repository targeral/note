---
progress: true
slideNumber: true
history: true
theme : "white"
transition: "zoom"
---

# React Hooks

---

## 一个简单的Hooks

--

简单的类组件

``` js
class Example extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        };
    }
    render() {
        return (
            <div>
                <p>You clicked {this.state.count} times</p>
                <button onClick={() => this.setState({ count: this.state.count + 1 })}>
                    Click me
                </button>
            </div>
        );
    }
}
```

--

使用hooks的版本：

``` js
import { useState } from 'react';
function Example() {
    const [count, setCount] = useState(0);
    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>
        </div>
    );
}
```

---

## React为什么要搞Hooks

--

## 想要复用一个有状态的组件太麻烦了！

--

类组件时代复用有状态组件的法宝：

* 高阶组件（Higher-Order Components） <!-- .element: class="fragment" data-fragment-index="2" -->

* 渲染属性（Render Props） <!-- .element: class="fragment" data-fragment-index="1" -->

--

``` js
import Cat from 'components/cat'
class DataProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { target: 'Zac' };
  }
  render() {
    return (
      <div>
        {this.props.render(this.state)}
      </div>
    )
  }
}
<DataProvider render={data => (
  <Cat target={data.target} />
)}/>
```

--

``` js
const withUser = WrappedComponent => {
    const user = sessionStorage.getItem("user");
    return props => <WrappedComponent user={user} {...props} />;
};
const UserPage = props => (
    <div class="user-container">
        <p>My name is {props.user}!</p>
    </div>
);
export default withUser(UserPage);
```

--

## 生命周期钩子函数里的逻辑太乱了吧！

do something in componentDidMount <!-- .element: class="fragment" data-fragment-index="1" -->

redo something in componentDidUpdate <!-- .element: class="fragment" data-fragment-index="2" -->

--

## classes真的太让人困惑了！

--

---

## 什么是State Hooks？

--

``` js
import { useState } from 'react';
function Example() {
    const [count, setCount] = useState(0);
    return (
        <div>
        <p>You clicked {count} times</p>
        <button onClick={() => setCount(count + 1)}>
            Click me
        </button>
        </div>
    );
}
```

--

``` js
let _useState = useState(0);
let count = _useState[0];
let setCount = _useState[1];
```

--

## 一个至关重要的问题

--

``` js
function add(n) {
    const result = 0;
    return result + 1;
}
add(1); //1
add(1); //1
```

--

## 假如一个组件有多个状态值怎么办？

--

``` js
function ExampleWithManyStates() {
    const [age, setAge] = useState(42);
    const [fruit, setFruit] = useState('banana');
    const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
```

--

## react是怎么保证多个useState的相互独立的？

--

``` js
//第一次渲染
useState(42);  //将age初始化为42
useState('banana');  //将fruit初始化为banana
useState([{ text: 'Learn Hooks' }]); //...
//第二次渲染
useState(42);  //读取状态变量age的值（这时候传的参数42直接被忽略）
useState('banana');  //读取状态变量fruit的值（这时候传的参数banana直接被忽略）
useState([{ text: 'Learn Hooks' }]); //...
```

--

``` js
let showFruit = true;
function ExampleWithManyStates() {
    const [age, setAge] = useState(42);
    
    if(showFruit) {
        const [fruit, setFruit] = useState('banana');
        showFruit = false;
    }
    
    const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
```

--

``` js
//第一次渲染
  useState(42);  //将age初始化为42
  useState('banana');  //将fruit初始化为banana
  useState([{ text: 'Learn Hooks' }]); //...
  //第二次渲染
  useState(42);  //读取状态变量age的值（这时候传的参数42直接被忽略）
  // useState('banana');  
  useState([{ text: 'Learn Hooks' }]); //读取到的却是状态变量fruit的值，导致报错
```

---

## 什么是Effect Hooks?

--

``` js
import { useState, useEffect } from 'react';
function Example() {
    const [count, setCount] = useState(0);
    // 类似于componentDidMount 和 componentDidUpdate:
    useEffect(() => {
        // 更新文档的标题
        document.title = `You clicked ${count} times`;
    });
    return (
        <div>
        <p>You clicked {count} times</p>
        <button onClick={() => setCount(count + 1)}>
            Click me
        </button>
        </div>
    );
}
```

--

类组件的版本：

``` js
class Example extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        count: 0
        };
    }
    componentDidMount() {
        document.title = `You clicked ${this.state.count} times`;
    }
    componentDidUpdate() {
        document.title = `You clicked ${this.state.count} times`;
    }
    render() {
        return (
        <div>
            <p>You clicked {this.state.count} times</p>
            <button onClick={() => this.setState({ count: this.state.count + 1 })}>
            Click me
            </button>
        </div>
        );
    }
}
```

--

## useEffect怎么解绑一些副作用

--

``` js
import { useState, useEffect } from 'react';
function FriendStatus(props) {
    const [isOnline, setIsOnline] = useState(null);
    function handleStatusChange(status) {
        setIsOnline(status.isOnline);
    }
    useEffect(() => {
        ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
        // 一定注意下这个顺序：告诉react在下次重新渲染组件之后，同时是下次调用ChatAPI.subscribeToFriendStatus之前执行cleanup
        return function cleanup() {
        ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
        };
    });
    if (isOnline === null) {
        return 'Loading...';
    }
    return isOnline ? 'Online' : 'Offline';
}
```

--

## 为什么要让副作用函数每次组件更新都执行一遍？

--

``` js
componentDidMount() {
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }
componentWillUnmount() {
    ChatAPI.unsubscribeFromFriendStatus(
        this.props.friend.id,
        this.handleStatusChange
    );
}
```

--

``` js

...
componentDidUpdate(prevProps) {
    // 先把上一个friend.id解绑
    ChatAPI.unsubscribeFromFriendStatus(
      prevProps.friend.id,
      this.handleStatusChange
    );
    // 再重新注册新但friend.id
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
}
...
```

--

页面首次渲染 <!-- .element: class="fragment" data-fragment-index="1" -->

替friend.id=1的朋友注册 <!-- .element: class="fragment" data-fragment-index="2" -->

突然friend.id变成了2 <!-- .element: class="fragment" data-fragment-index="3" -->

页面重新渲染 <!-- .element: class="fragment" data-fragment-index="4" -->

清除friend.id=1的绑定 <!-- .element: class="fragment" data-fragment-index="5" -->

替friend.id=2的朋友注册 <!-- .element: class="fragment" data-fragment-index="6" -->

--

## 怎么跳过一些不必要的副作用函数

--

``` js
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]); // 只有当count的值发生变化时，才会重新执行`document.title`这一句
```

---

--

## 还有哪些自带的Effect Hooks?

--

* useContext
* useReducer
* useCallback
* useMemo
* useRef
* useImperativeMethods
* useMutationEffect
* useLayoutEffect

--

``` html
<DropDownMenu
    ...
    onSortChange={sort => sendTracker('sort', sort)}
/>
```

--

``` js
const handleOnSortChange = useCallback(sort => {
    sendTracker('sort', sort);
}, []);
```

---

Thanks
