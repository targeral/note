# WebGL学习

**WebGL程序运行在浏览器中的JavaScript和运行在WebGL系统的着色器程序这两个部分**

## 齐次坐标

齐次坐标使用如下的符号描述：`(x, y, z, w)`。齐次坐标`(x, y, z, w)`等价于三维坐标`(x/w, y/w, z/w)`。所以如果齐次坐标的第四个分量是1，你就可以将它当做三维坐标来使用。w的值必须是大于等于0的。如果w趋近于0，那么它所表示的点将无限趋近于无穷远，所以在齐次坐标中可以有无穷的概念。齐次坐标的存在，使得用矩阵乘法来描述顶点变为可能，三维图形系统在计算过程中，通常使用齐次坐标来表示顶点的三维坐标。

## 片元着色器的内置变量

* vec4 gl_FragColor 指定片元颜色(rgba格式)

## 顶点着色器的内置变量

* vec4 gl_Position 表示顶点位置【必须】
* float gl_PointSize 表示点的尺寸（像素数）【默认为1.0】

## gl.drawArrays(mode, first, count) 绘制函数

### 参数

* mode 指定绘制的方式，可以接收一下常量符号：
    * gl.POINTS
    * gl.LINES
    * gl.LINE_STRIP
    * gl.LINE_LOOP
    * gl.TRIANGLES
    * gl.TRIANGLE_STRIP
    * gl.TRIANGLE_FAN

* first 指定从哪个顶点开始绘制（整型数）
* count 指定绘制需要用到多少个顶点（整型数）

### 返回值

无

### 错误

* INVALID_ENUM 传入的mode参数不是前述参数之一
* INVALID_VALUE 参数first或count是负数

### 描述

例如`gl.drawArrays(gl.POINTS, 0, 1)`，当程序调用`gl.drawArrays()`时，顶点着色器将被执行count次，每次处理一个顶点。

## WebGL坐标系统

!(./webgl-axes.png)[wegbl坐标系]

WebGL坐标系统采用三维坐标系统（笛卡尔坐标系）。通常，在WebGL中，当你面向计算机屏幕时，X轴是水平的（正方向为右），Y轴是垂直的（正方向为上），而Z轴垂直于屏幕（正方向为外）。

## 将数据从JavaScript中写入到着色器中

为了让程序更具有扩展性，能够从JavaScript中奖数据写入到着色器中，我们需要使用`attribute`和`uniform`变量。使用哪一个变量取决于需传输的数据本身，`attribute`变量传输是那些与顶点相关的数据，而`uniform`变量传输的是那些对于所有顶点都相同（或与顶点无关）的数据。

### attribute

`attribute`是一种GLSL ES变量，被用来从外部向顶点着色器内传输数据，只有顶点着色器能使用它。

#### 使用attribute变量的步骤

1. 在顶点着色器中声明attribute变量。
2. 将`attribute`变量赋值给`gl_Position`变量。
3. 向`attribute`变量传输数据。

##### 在顶点着色器中声明attribute变量以及将`attribute`变量赋值给`gl_Position`变量

``` glsl es
attribute vec4 a_Position;
void main() {
    gl_Position = a_Position;
}
```

关键词`attribute`被称为存储限定符，它表示接下来的变量是一个attribute变量。attribute变量必须声明成全局变量，将数据从着色器外部传给该变量。变量的声明必须按照以下的格式：

```
<存储限定符> <类型> <变量名>
attribute vec4 a_Position
```

##### 向`attribute`变量传输数据

要向`attribute`变量传输数据，首先需要获取到该变量的**存储地址**。使用`gl.getAttribLocation(program, name)`来获取地址：

* 参数：
    * program 指定包含顶点着色器和片元着色器的着色器程序对象，这里是gl.program。
    * name 指定想要获取其存储地址的attribute变量的名称

* 返回值：
    * 大于等于0 attribute变量的存储地址
    * -1 指定的attribute变量不存在，或者其命名具有`gl_`或`webgl_`前缀。
* 错误：
    * INVALID_OPERATION 程序对象未能成功连接
    * INVALID_VALUE name参数的长度大于attribute变量名的最大长度（默认为256字节）。

一旦获取到attribute变量的存储地址，我们就可以向该变量传入值。使用`gl.vertexAttrib3f(location, v0, v1, v2)`函数来完成这一步：

* 参数
    * location 指定将要修改的attribute变量的存储位置
    * v0 指定填充attribute变量第一个分量的值
    * v1 指定填充attribute变量第二个分量的值
    * v2 指定填充attribute变量第三个分量的值

* 返回值：无
* 错误：
    * INVALID_OPERATION 没有当前的program对象
    * INVALID_VALUE location大于等于attribute变量的最大数目（默认为8）

**注意点1：着色器代码中的a_Position变量是一个vec4类型，但是使用gl.vertexAttrib3f()仅传了三个分量值而不是4个。这是因为该方法会默认将第四个分量设置为1.0。像颜色值的第四个分量为1.0表示该颜色完全不透明，而齐次坐标的第四个分量为1.0使其与三维坐标对应起来。所以1.0是一个安全的第四分量。**

========================

**扩展**

gl.vertexAttrib3f是一系列同族函数的一个。

* gl.vertexAttrib1f(location, v0) 仅传输一个值，这个值将被填充到attribute变量的第一个分量，第2，3个分量将被设置为0.0，第四个设为1.0.
* gl.vertexAttrib2f(location, v0, v1) 类gl.vertexAttrib1f。
* gl.vertexAttrib3f(location, v0, v1, v2)
* gl.vertexAttrib4f(location, v0, v1, v2, v3)

你也可以使用这些方法的矢量版本，它们的名字以“v”结尾，并接受类型化数组作为参数。

``` js
let position = new Float32Array([1.0, 2.0, 3.0, 1.0]);
gl.vertexAttrib4fv(a_Position, position);
```

========================

### uniform

可以使用`uniform`变量将颜色值传给着色器，其步骤与用`attribute`类似。这次以片元着色器为例：

1. 在片元着色器中准备`uniform`变量
2. 用这个`uniform`变量向`gl_FragColor`赋值。
3. 将颜色数据从JavaScript中传给该`uniform`变量。

#### 在片元着色器中准备`uniform`变量以及用这个`uniform`变量向`gl_FragColor`赋值。

``` glsl es
precision mediump float;
uniform vec4 u_FragColor;
void main() {
    gl_FragColor = u_FragColor;
}
```

在使用uniform变量之前，首选需要按照与声明attribute变量相同的格式`<存储限定符><类型><变量名>`来声明uniform变量。

**注意：`precision mediump float;`这段代码使用精度限定词来指定变量的范围（最大值与最小值）和精度，这里为中等精度。**

#### 将颜色数据从JavaScript中传给该`uniform`变量

我们还是首先要**获取uniform变量的存储地址**，可以使用`gl.getUniformLocation(program, name)`方法来获取uniform变量的存储地址：

* 参数
    * program 指定包含顶点着色器和片元着色器程度对象
    * name 指定想要获取其存储位置的uniform变量的名称

* 返回值
    * non-null 指定uniform变量的位置
    * null 指定的uniform变量不存在，或者其命名具有`gl_`或`webgl_`前缀

* 错误
    * INVALID_OPERATION 程序对象未能成功连接
    * INVALID_VALUE name参数的长度大于uniform变量名的最大长度（默认256字节）

**gl.getUniformLocation方法要注意的：与`gl.getAttribLocation`方法很相似，不同点是“如果uniform变量不存在或者其命名使用了保留字前缀，那么函数返回的是`null`而不是`-1`”。**

有了uniform变量的存储地址，就可以使用`gl.uniform4f(location, v0, v1, v2, v3)`向变量中写入数据：

* 参数
    * location 指定将要修改的uniform变量的存储位置
    * v0 指定填充uniform变量第一个分量的值
    * v1 指定填充uniform变量第二个分量的值
    * v2 指定填充uniform变量第三个分量的值
    * v3 指定填充uniform变量第四个分量的值

* 返回值：无

* 错误
    * INVALID_OPERATION 没有当前program对象，或者location是非法的变量存储位置。

gl.uniform4f也有一系列同族函数：

* gl.uniform1f(location, v0)
* gl.uniform2f(location, v0, v1)
* gl.uniform3f(location, v0, v1, v2)
* gl.uniform4f(location, v0, v1, v2, v3)

## 缓冲区对象

### gl.createBuffer()

创建缓冲区对象

#### 返回值

* 非null 新创建的缓冲区对象
* null 创建缓冲区对象失败

#### 错误

无

### gl.deleteBuffer(buffer)

删除参数buffer表示的缓冲区对象

#### 参数

* buffer 待删除的缓冲区对象

#### 返回值

无

#### 错误

无

### gl.bindBuffer(target, buffer)

允许使用buffer表示的缓冲区对象并将其绑定到target表示的目标上。

#### 参数

* target 参数可以是一下中的一个：
    * `gl.ARRAY_BUFFER` 表示缓冲区对象包含了顶点的数据
    * `gl.ELEMENT_ARRAY_BUFFER` 表示缓冲区对象中包含了顶点的索引值

* buffer 指定之前由gl.createBuffer()返回的待绑定的缓冲区对象，如果指定为null，则禁用对target的绑定。

#### 返回值

无

#### 错误

* INVALID_ENUM target不是上述之一，这时将保持原有的绑定情况不变