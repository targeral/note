# 文章

[原文地址](https://yrq110.me/post/devops/how-lerna-manage-package-dependencies/)

## 问题

>该方法的问题是，当多个package中拥有多个相同且同版本的依赖时，它们会被安装多次，分别安装在包含它们的package下，造成空间的浪费，降低构建速度。为了解决这个问题可以使用hoist功能来执行依赖的安装。

**为什么会降低构建速度？**
