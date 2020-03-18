# webpack resolve配置复习

`resolve`用于帮助我们如何处理、解析模块。

## webpack中的解析规则

webpack支持三种文件路径的解析，分别为绝对路径、相对路径、模块路径。

绝对路径和相对路径都比较好理解，如果取到绝对路径，就不需要进一步再做解析，因为已经找到了；如果使用相对路径，则会以当前调用`import/require`的资源文件所在目录为上下午目录开始解析，以产生模块的绝对路径。

这里要说一下模块路径。

### 模块路径

``` js
import "module";
import "module/lib/file";
```

模块将在`resolve.modules`中指定的所有目录搜索。我们还可以通过`resolve.alias`配置选项来为模块路径创建别名。通过别名我们也可以找到其对应的路径。

一旦根据上述规则解析路径后，解析器将检查路径是否指向文件或者目录。如果路径指向一个文件：

* 如果路径具有文件扩展名，则被直接文件打包。
* 否则，将使用`resolve.extensions`选项里的文件扩展名来解析，此选项会让解析器尝试它所提供的扩展名，直到找到为止。

如果路径指向一个文件夹，则采取以下步骤找到具有正确扩展名的正确文件：

* 如果文件夹中包含 package.json 文件，则按照顺序查找 resolve.mainFields 配置选项中指定的字段。并且 package.json 中的第一个这样的字段确定文件路径。
* 如果 package.json 文件不存在或者 package.json 文件中的 main 字段没有返回一个有效路径，则按照顺序查找 resolve.mainFiles 配置选项中指定的文件名，看是否能在 import/require 目录下匹配到一个存在的文件名
* 文件扩展名通过 resolve.extensions 选项采用类似的方法进行解析。

webpack 根据构建目标(build target)为这些选项提供了合理的默认配置。

### 4.3.0内容更新

webpack Module可以用各种方式表达他们的依赖，例如下面的一些例子：

* ES2015的`import`
* CommonJS的`require()`
* AMD的`define`和`require`
* 在css/sass/less文件里的`@import`
* 在样式表里引用一个图片的`url(...)`或者在html中`<img src="....">`

通过loaders，webpack支持使用各种语言和预处理器以及loaders编写的模块。loaders向webpack描述如何处理非JavaScript模块并将这些依赖包括在你的bundle中。webpack社区已经为各种流行语言和语言处理器构建了loaders，包括：

* CoffeeScript
* TypeScript
* ESNext(Babel)
* Sass
* Less
* Stylus等。

## webpack中的resolve

### resolve
**Object**

用于配置模块如何解析。

### resolve.alias
**object**

使用此属性，可以使得去`import/require`特定模块的时候更加容易。此属性可以理解为为特定路径（比较长的那种）起别名。例如：

``` javascript
alias: {
    '@': path.resolve(__dirname, 'src')
}
```

这样我们之前通过这样的方式引导模块：

``` js
import Utility from '../../src/a';
```

现在只需要通过如下即可：

```js
import Utility from '@/a';
```

也可以在给定的key（键）后面的末尾添加`$`，以表示精确匹配：

``` js
alias: {
  xyz$: path.resolve(__dirname, 'path/to/file.js')
}
```

这将产生以下结果：

``` js
import Test1 from 'xyz'; // 精确匹配，所以 path/to/file.js 被解析和导入
import Test2 from 'xyz/file.js'; // 非精确匹配，触发普通解析
```

### resolve.aliasFields
**string**

指定一个字段，例如 browser，根据此[规范](https://github.com/defunctzombie/package-browser-field-spec)进行解析。默认：

```sh
aliasFields: ["browser"]
```

### resolve.cacheWithContext
**boolean（从 webpack 3.1.0 开始）**

如果启用了不安全缓存，请在缓存键(cache key)中引入 request.context。这个选项被 enhanced-resolve 模块考虑在内。从 webpack 3.1.0 开始，在配置了 resolve 或 resolveLoader 插件时，解析缓存(resolve caching)中的上下文(context)会被忽略。这解决了性能衰退的问题。

### resolve.descriptionFiles
**array**

用于描述的 JSON 文件。默认：

``` sh
descriptionFiles: ["package.json"]
```

### resolve.enforceExtension
**boolean**

如果是 true，将不允许无扩展名(extension-less)文件。默认如果 ./foo 有 .js 扩展，require('./foo') 可以正常运行。但如果启用此选项，只有 require('./foo.js') 能够正常工作。默认：

```sh
enforceExtension: false
```

### resolve.enforceModuleExtension
**boolean**

对模块是否需要使用的扩展（例如 loader）。默认：

``` sh
enforceModuleExtension: false
```

### resolve.extensions
**array**

自动解析确定的扩展。默认值为:

```js
extensions: [".js", ".json"]
```

*使用此选项，会覆盖默认数组，这就意味着 webpack 将不再尝试使用默认扩展来解析模块。对于使用其扩展导入的模块，例如，import SomeFile from "./somefile.ext"，要想正确的解析，一个包含“*”的字符串必须包含在数组中。*

### resolve.mainFields
**array**

当从 npm 包中导入模块时（例如，import * as D3 from "d3"），此选项将决定在 package.json 中使用哪个字段导入模块。根据 webpack 配置中指定的 target 不同，默认值也会有所不同。

当 target 属性设置为 webworker, web 或者没有指定，默认值为

``` js
mainFields: ["browser", "module", "main"]
```

对于其他任意的 target（包括 node），默认值为：

``` js
mainFields: ["module", "main"]
```

### resolve.mainFiles
**array**

解析目录时要使用的文件名。默认:

``` js
mainFiles: ["index"]
```

### resolve.modules

告诉 webpack 解析模块时应该搜索的目录。

绝对路径和相对路径都能使用，但是要知道它们之间有一点差异。

通过查看当前目录以及祖先路径（即 ./node_modules, ../node_modules 等等），相对路径将类似于 Node 查找 'node_modules' 的方式进行查找。

使用绝对路径，将只在给定目录中搜索。

resolve.modules defaults to:

``` js
modules: ["node_modules"]
```

如果你想要添加一个目录到模块搜索目录，此目录优先于 node_modules/ 搜索：

``` js
modules: [path.resolve(__dirname, "src"), "node_modules"]
```

### resolve.unsafeCache
**regex array boolean**

启用，会主动缓存模块，但并不安全。传递 true 将缓存一切。默认：

``` js
unsafeCache: true
```

正则表达式，或正则表达式数组，可以用于匹配文件路径或只缓存某些模块。例如，只缓存 utilities 模块：

``` js
unsafeCache: /src\/utilities/
```

### resolve.plugins

应该使用的额外的解析插件列表。它允许插件，如 DirectoryNamedWebpackPlugin。

``` js
plugins: [
  new DirectoryNamedWebpackPlugin()
]
```

### resolve.symlinks

### resolve.cachePredicate
**function**

决定请求是否应该被缓存的函数。函数传入一个带有 path 和 request 属性的对象。默认：

``` js
cachePredicate: function() { return true }
```

### resolveLoader
**object**

这组选项与上面的 resolve 对象的属性集合相同，但仅用于解析 webpack 的 loader 包。默认：

``` js
{
  modules: [ 'node_modules' ],
  extensions: [ '.js', '.json' ],
  mainFields: [ 'loader', 'main' ]
}
```

*注意，这里你可以使用别名，并且其他特性类似于 resolve 对象。例如，{ txt: 'raw-loader' } 会使用 raw-loader 去 shim(填充) txt!templates/demo.txt。*

### resolveLoader.moduleExtensions
**array**

解析 loader 时，用到扩展名(extensions)/后缀(suffixes)。从 webpack 2 开始，我们强烈建议使用全名，例如 example-loader，以尽可能清晰。然而，如果你确实想省略 -loader，也就是说只使用 example，则可以使用此选项来实现

``` js
moduleExtensions: [ '-loader' ]
```
