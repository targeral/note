# Ajv: 另一个JSON模式验证器

## Using version 6

支持draft-07的Ajv版本6.0.0已发布。
可能需要迁移模式或更新代码（要继续使用draft-04和v5模式，将支持draft-06模式而不进行更改）

请注意：要将Ajv与draft-06模式一起使用，您需要将元模式显式添加到验证器实例：

`ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));`

要将Ajv与draft-04模式一起使用，除了显式添加元模式之外，还需要使用选项schemaId：

``` js
var ajv = new Ajv({schemaId: 'id'});
// If you want to use both draft-04 and draft-06/07 schemas:
// var ajv = new Ajv({schemaId: 'auto'});
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
```

## Content

### Performance

### Features

* Ajv实现了完整的JSON Schema [draft-06/07和draft-04](http://json-schema.org/)标准：
    * 所有验证关键字
    * 完全支持远程引用（必须使用addSchema添加远程模式或编译为可用）
    * 支持模式之间的循环引用
    * 具有unicode对的字符串的正确字符串长度（可以关闭）
    * 