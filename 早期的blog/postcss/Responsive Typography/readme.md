# 响应式排版

[postcss-responsive-type](https://github.com/seaneking/postcss-responsive-type)是postcss的一个插件，用于创建响应式排版。通过对`font-size`、`line-height`和`letter-spacing`使用`responsive`属性值，使得随着屏幕宽度的变化而做出变化。

## 关于插件的使用

通常的使用方式：

``` css
html {
    font-size: responsive;
    line-height: responsive;
    letter-spacing: responsive;
}
```

我们也可以指定参数，单位可以是`px`、`rem`或者是`em`。当使用`em`的时候，确保`font-range`属性值使用的是`em`单位：

``` css
html {
    font-size: responsive 12px 21px; /* font-size的最小值和最大值 */
    font-range: 420px 1280px; /* 视图的宽度范围，在这个范围内，font-size的属性值是随之变化的*/

    line-height: responsive 1.2em 1.8em;
    line-height-range: 420px 1280px;

    letter-spacing: responsive 0px 4px;
    letter-spacing-range: 420px 1280px;
}
```

扩展语法：

``` css
html {
    font-size: responsive;
    min-font-size: 12px;
    max-font-size: 21px;
    lower-font-range: 420px;
    upper-font-range: 1280px;

    line-height: responsive;
    min-line-height: 1.2em;
    max-line-height: 1.8em;
    lower-line-height-range: 420px;
    uppper-line-height-range: 1280px;

    letter-spacing: responsive;
    min-letter-spacing: 0px;
    max-letter-spacing: 4px;
    lower-letter-spacing-range: 420px;
    upper-letter-spacing-range: 1280px;
}
```

当你只是使用`responsive`属性值的时候，其默认值如下：

`font-size`

* `min-font-size`: 14px
* `max-font-size`: 21px
* `lower-font-range`: 420px
* `upper-font-range`: 1280px

`line-height`

* `min-line-height`: 1.2em
* `max-line-height`: 1.8em
* `lower-line-height-range`: 420px
* `upper-line-height-range`: 1280px

`letter-spacing`

* `min-letter-spacing`: 0px
* `max-letter-spacing`: 4px
* `lower-letter-spacing-range`: 420px
* `upper-letter-spacing-range`: 1280px

关于浏览器支持，`postcss-responsive-type`使用的是`calc`、`vw`单位和媒体查询，因此在所有的现代浏览器（IE9+）都可使用，尽管如此，Opera Mini是不支持的。

对于这种情况，你可以做一个简单的兼容操作：

``` css
.foo {
    font-size: 16px;
    font-size: responsive;
}
```

## 关于插件的原理

``` js
module.exports = postcss.plugin('postcss-responsive-type', () => {
  return function (css, result) {
    css.walkRules(function(rule){
      let thisRule,
          newRules;

      // Check root font-size (for rem units)
      if (rule.selector.indexOf('html') > -1){
        rule.walkDecls('font-size', decl => {
          if (decl.value.indexOf('px') > -1){
            rootSize = decl.value;
          }
        });
      }

      rule.walkDecls(/^(font-size|line-height|letter-spacing)$/, decl => {
        let params;

        // If decl doesn't contain responsve keyword, exit
        if (decl.value.indexOf('responsive') === -1) {
          return;
        }

        thisRule = decl.parent;
        params = fetchParams(thisRule, decl.prop);
        newRules = buildRules(thisRule, decl.prop, params, result);

        // Insert the base responsive decleration
        if (decl.value.indexOf('responsive') > -1) {
          decl.replaceWith({ prop: decl.prop, value: newRules.responsive });
        }

        // Insert the media queries
        thisRule.parent.insertAfter(thisRule, newRules.minMedia);
        thisRule.parent.insertAfter(thisRule, newRules.maxMedia);
      });
    });
  };
});
```

由上面的代码我先知道一些关于postcss插件的知识。

### postcss插件的声明

``` js
const postcss = require('postcss')
module.exports = postcss.plugin('your-post-plugin-name', (options) => {
    return (css, result) => {

    }
})
```

其中options是可选项，在被当作插件时候，可以传入参数。例如：

``` js
const yourPostCssPlugin = require('your-post-plugin-name')
postcss([yourPostCssPlugin(options)])
```

其中css的就是你处理的css内容。

### 遍历CSS的Rule

postcss将css代码转换为一个Tree（应该是AST），它将CSS各个部分变为了各种节点。其中像`h1{color: red;}`叫做CSS规则，用Rule节点表示；而其中的`color: red;`则是一条声明，用Declaration节点表示。一共有5种节点：

* `Root`: 表示一个CSS文件和该文件解析后的节点集合。可以理解为根节点。包含该文件所有的CSS信息。
* `AtRule`: 表示CSS中的@指令节点，比如`@media print {...}`
* `Rule`: 表示一条CSS规则，包含一个选择器和一个声明块（声明的集合），比如：`h1{color: red; font-size: 12px;}`
* `Declaration`: 表示一条CSS样式声明，由属性和属性值组成，比如：`color: red;`
* `Comment`: 表示一个位于样式属性或属性值之间的注释，比如：`a { color: /* inner */ red;}`

而postcss插件就是对这些节点进行操作，然后再转换为css代码，不过这都是之后的事情了。我们再插件中要做的重要事情之一就是遍历节点。通常我们会遍历Rule节点，通过Tree的`walkRules`可以遍历每一个Rule节点。

``` js
css.walkRules(rule => {
    
})
```

现在我们看一下`post-responsive-type`插件的代码：

``` js
// Assign default root size
let rootSize = '16px';

css.walkRules(function(rule){
    let thisRule,
        newRules;

    // Check root font-size (for rem units)
    if (rule.selector.indexOf('html') > -1){
        rule.walkDecls('font-size', decl => {
            if (decl.value.indexOf('px') > -1){
                rootSize = decl.value;
            }
        });
    }
    ...
}
```

我们之前说到，一个Rule节点是由选择器和声明块组成。这里通过Rule的`selector`属性来判断选择器是否是`html`元素。然后我们会看到，当确定是html元素后，它继续遍历了html规则下的声明集合。

Rule节点的`walkDecls`方法用于遍历一个Rule节点下的所有CSS声明，有两种方式使用：

* 第一种通过`walkDecls(() => {decl})`，会直接遍历所有内容。
* 第二种通过`walkDecls('filterKey', (decl) => {})`，会去过滤所有不是`filterKey`的内容。

这里获取了`html`下`font-size`属性的那条声明，然后判断其属性值的单位是否是`px`,如果是的话，将把全局变量`rootSize`替换。

接下来：

``` js
rule.walkDecls(/^(font-size|line-height|letter-spacing)$/, decl => {
    let params;

    // If decl doesn't contain responsve keyword, exit
    if (decl.value.indexOf('responsive') === -1) {
        return;
    }

    thisRule = decl.parent;
    params = fetchParams(thisRule, decl.prop);
    newRules = buildRules(thisRule, decl.prop, params, result);

    // Insert the base responsive decleration
    if (decl.value.indexOf('responsive') > -1) {
        decl.replaceWith({ prop: decl.prop, value: newRules.responsive });
    }

    // Insert the media queries
    thisRule.parent.insertAfter(thisRule, newRules.minMedia);
    thisRule.parent.insertAfter(thisRule, newRules.maxMedia);
});
```

当不是`html`规则时候，遍历声明集合查找属性为`font-size`、`line-height`和`letter-spacing`的声明，并且在其属性值不是`responsive`的时候，退出程序。

然后我们先暂停对于代码的分析，来看一下实现响应式排版的原理。

以`font-size`为例，我们可以通过使用`calc`来限制字体的缩放，例如：

``` css
:root {
    font-size: calc(16px + 3vw);
}
```

我们还可以通过媒体查询的方式，例如：

``` css
:root {
    font-size: 18px;
}
@media (min-width: 600px) {
    :root {
        font-size: 3vw;
    }
}
```

而一般情况下，我们可能希望在一定的范围内来控制字体的缩放。所以我们可以通过`calc`和媒体查询来配合使用。

假设我们希望在viewport的`width`小于400px的时候，其字体大小为12px，大于800px的时候，字体大小为24px，而在400px到800px期间响应式排版。

当viewport从400px到800px时候，字体的变化是从12px到24px。将设某一个时刻，viewport为w，字体大小为f，此时viewport从400px到 w px，字体的变化是从12px到 f px。则有关系：

`(800 - 400) / (24 - 12) = (w - 400) / (f - 12)`

由此我们可以得到此时字体的大小为：

`f = 12px + (24 - 12) * ((w - 400px) / (800 - 400))`

w如何表示呢？我们可以通过100vw来表示。所以我们可以得到：

`font-size: calc( 12px + (24 - 12) * ( (100vw - 400px) / ( 800 - 400) ));`

这便是核心内容。

由此我们可以得到公式：

`minSize + (maxSize - minSize) * ((100vw - minWidth) / (maxWidth - minWidth))`

我们回到代码来看一下：

``` js
thisRule = decl.parent;
params = fetchParams(thisRule, decl.prop);
newRules = buildRules(thisRule, decl.prop, params, result);

// Insert the base responsive decleration
if (decl.value.indexOf('responsive') > -1) {
    decl.replaceWith({ prop: decl.prop, value: newRules.responsive });
}

// Insert the media queries
thisRule.parent.insertAfter(thisRule, newRules.minMedia);
thisRule.parent.insertAfter(thisRule, newRules.maxMedia);
```

大致思路是：当属性是`font-size`、`line-height`、`letter-spacing`，属性值存在`responsive`的时候，获取相关参数，创建新的规则，然后替换掉之前带有responsive的规则，并插入媒体查询的规则。

接下来我们看一下各个部分的实现。

``` js
function fetchParams(rule, declName) {
  let params = Object.assign({}, DEFAULT_PARAMS[declName]),
      rangeDecl;

  // Fetch params from shorthand declName, i.e., font-size or line-height, etc
  fetchResponsiveSizes(rule, declName, (minSize, maxSize) => {
    params.minSize = minSize;
    params.maxSize = maxSize;
  });

  // Fetch params from shorthand font-range or line-height-range
  fetchRangeSizes(rule, PARAM_RANGE[declName], (minSize, maxSize) => {
    params.minWidth = minSize;
    params.maxWidth = maxSize;
  });

  // Fetch parameters from expanded properties
  rangeDecl = PARAM_DECLS[declName];

  Object.keys(rangeDecl).forEach(param => {
    rule.walkDecls(rangeDecl[param], decl => {
      params[param] = decl.value.trim();
      decl.remove();
    });
  });

  return params;
}
```

`fetchParams()`方法传入了当前声明所在的规则（声明集合）以及当前声明的属性名。`fetchParams`函数首先拿默认的参数。每个属性名对应一个默认配置。

``` js
const DEFAULT_PARAMS = {
    'font-size': {
        minSize: '12px',
        maxSize: '21px',
        minWidth: '420px',
        maxWidth: '1280px'
    },
    'line-height': {
        minSize: '1.2em',
        maxSize: '1.8em',
        minWidth: '420px',
        maxWidth: '1280px'
    },
    'letter-spacing': {
        minSize: '0px',
        maxSize: '4px',
        minWidth: '420px',
        maxWidth: '1280px'
    }
};
```

然后分别调用`fetchResponsiveSizes`和`fetchRangeSizes`方法在参数对象params上修改或者添加了`minSize`、`maxSize`、`minWidth`和`maxWidth`。再根据属性名获取扩展名称对应的params内的属性。

``` js
const PARAM_DECLS = {
    'font-size': {
        minSize: 'min-font-size',
        maxSize: 'max-font-size',
        minWidth: 'lower-font-range',
        maxWidth: 'upper-font-range'
    },
    'line-height': {
        minSize: 'min-line-height',
        maxSize: 'max-line-height',
        minWidth: 'lower-line-height-range',
        maxWidth: 'upper-line-height-range'
    },
    'letter-spacing': {
        minSize: 'min-letter-spacing',
        maxSize: 'max-letter-spacing',
        minWidth: 'lower-letter-spacing-range',
        maxWidth: 'upper-letter-spacing-range'
    }
}
```

然后遍历`PARAM_DECLS`，查找声明集合属性名为扩展名称（`PARAM_DECLS里每个属性的属性值`）的声明，然后把其属性值添加到参数对象`params`上，最后把那条声明移除。


最后返回处理好的参数params：

``` js
{
    minSize: '',
    maxSize: '',
    minWidth: '',
    maxWidth: ''
}
```

接下来我们看一下在这个过程中参数的获取的逻辑。

``` js
function fetchResponsiveSizes(rule, declName, cb) {
    rule.walkDecls(declName, decl => {

        if (decl.value.indexOf('responsive') > -1) {
            let vals = decl.value.match(/-?\d*\.?\d+(?:\w+)?/g);

            if (vals) {
                cb(vals[0], vals[1]);
            }
        }
    });
}
```

`fetchResponsiveSizes`函数用户获取在`responsive`属性值后的两个值——`minSize`和`maxSize`。（可以看指定参数部分）逻辑也很简单，遍历声明获取指定的属性名的那条声明，然后盘是否存在`responsive`字段并且通过正则获取匹配到的内容。如果存在匹配的内容，就调用回调函数并将匹配的内容作为回调函数的参数。

``` js
function fetchRangeSizes(rule, declName, cb){
    rule.walkDecls(declName, decl => {
        let vals = decl.value.split(/\s+/);

        cb(vals[0], vals[1]);
        decl.remove();
    });
}
```

`fetchRangeSizes`函数用户获取属性名为`*-range`的属性值。输入的`PARAM_RANGE[declName]`为`*-range`属性名称：

``` js
const PARAM_RANGE = {
    'font-size': 'font-range',
    'line-height': 'line-height-range',
    'letter-spacing': 'letter-spacing-range'
}
```

然后函数就是去遍历声明，获取特定属性名的声明，对属性值进行分割得到两个值，调用回调函数，将两个值作为回调函数的参数，最后移除该声明。

当我们获取完参数，我们就可以构建新的规则。

``` js
function buildRules(rule, declName, params, result) {
    let rules = {},
        minSize = params.minSize,
        maxSize = params.maxSize,
        minWidth,
        maxWidth,
        sizeUnit = getUnit(params.minSize),
        maxSizeUnit = getUnit(params.maxSize),
        widthUnit = getUnit(params.minWidth),
        maxWidthUnit = getUnit(params.maxWidth),
        sizeDiff,
        rangeDiff;

    if (sizeUnit === null) {
        throw rule.error('sizes with unitless values are not supported');
    }

    if (sizeUnit !== maxSizeUnit && widthUnit !== maxWidthUnit) {
        rule.warn(result, 'min/max unit types must match');
    }

    if (sizeUnit === 'rem' && widthUnit === 'px') {
        minWidth = pxToRem(params.minWidth);
        maxWidth = pxToRem(params.maxWidth);
    } else if (sizeUnit === widthUnit || sizeUnit === 'rem' && widthUnit === 'em') {
        minWidth = params.minWidth;
        maxWidth = params.maxWidth;
    } else {
        rule.warn(result, 'this combination of units is not supported');
    }

    // Build the responsive type decleration
    sizeDiff = parseFloat(maxSize) - parseFloat(minSize);
    rangeDiff = parseFloat(maxWidth) - parseFloat(minWidth);

    rules.responsive = 'calc(' + minSize + ' + ' + sizeDiff + ' * ((100vw - ' + minWidth + ') / ' + rangeDiff + '))';

    // Build the media queries
    rules.minMedia = postcss.atRule({
        name: 'media',
        params: 'screen and (max-width: ' + params.minWidth + ')'
    });

    rules.maxMedia = postcss.atRule({
        name: 'media',
        params: 'screen and (min-width: ' + params.maxWidth + ')'
    });

    // Add the required content to new media queries
    rules.minMedia.append({
        selector: rule.selector
    }).walkRules(selector => {
        selector.append({
        prop: declName,
        value: params.minSize
        });
    });

    rules.maxMedia.append({
        selector: rule.selector
    }).walkRules(selector => {
        selector.append({
        prop: declName,
        value: params.maxSize
        });
    });

    return rules;
}
```

这里比较重要的一点是对不同单位情况的处理。

* 当size的单位为`rem`，视图的单位为`px`时候，需要将视图的宽度的单位转换为`rem`。
* 当size的单位与视图的宽度的单位相同时候或者size的单位是`rem`视图宽度的单位是`em`时候，直接赋值。
* 除此之外，会报错。

其他地方就是：

``` js
// Build the responsive type decleration
sizeDiff = parseFloat(maxSize) - parseFloat(minSize);
rangeDiff = parseFloat(maxWidth) - parseFloat(minWidth);

rules.responsive = 'calc(' + minSize + ' + ' + sizeDiff + ' * ((100vw - ' + minWidth + ') / ' + rangeDiff + '))'; 
```

构建我们之前说的公式。

``` js
// Build the media queries
rules.minMedia = postcss.atRule({
    name: 'media',
    params: 'screen and (max-width: ' + params.minWidth + ')'
});

rules.maxMedia = postcss.atRule({
    name: 'media',
    params: 'screen and (min-width: ' + params.maxWidth + ')'
});
```
创建媒体查询的规则。

``` js
// Add the required content to new media queries
rules.minMedia.append({
    selector: rule.selector
}).walkRules(selector => {
    selector.append({
    prop: declName,
    value: params.minSize
    });
});

rules.maxMedia.append({
    selector: rule.selector
}).walkRules(selector => {
    selector.append({
    prop: declName,
    value: params.maxSize
    });
});
```

在媒体查询下添加规则，当超过或者小于范围的时候，size（font-size, line-height, letter-spacing）为多少。

我们可以看一个例子：

转换之前：

``` css
.foo {
    font-size: responsive;
}
```

转换后：

``` css
.foo {
    font-size: calc(12px + 9 * ((100vw - 420px) / 860));
}
@media screen and (min-width: 1280px) {
    .foo {
        font-size: 21px;
    }
}
@media screen and (max-width: 420px) {
    .foo {
        font-size: 12px;
    }
}
```

## 参考

[Precise control over responsive typography](https://www.madebymike.com.au/writing/precise-control-responsive-typography/)