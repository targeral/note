# 写一个postcss插件凑合看指南

## writing-your-first-postcss-plugin

### 初始化一个代码模板

下载代码库：

```
git clone git@github.com:postcss/postcss-plugin-boilerplate.git
```

接下来，从该repo运行向导脚本：

```
node ./postcss-plugin-boilerplate/start
```

最后你就拥有了一个初始化的postcss插件的开发模板。

### 

### 总结

#### 什么是postcss（postcss做了什么）

PostCSS允许我们使用JavaScript能力修改CSS代码。它完成了三件事：

1. postcss将你的css文件转换为js对象
2. postcss plugin可以遍历这些对象并且进行增加、移除、修改css选择器及属性。
3. 最后它会将处理过的对象再转换为css文件。

#### 如何写