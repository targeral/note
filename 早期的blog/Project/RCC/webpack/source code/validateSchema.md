# validateSchema

``` js
const validateSchema = require("./validateSchema");
...
const webpack = (options, callback) => {
    const webpackOptionsValidationErrors = validateSchema(
        webpackOptionsSchema,
        options
    );
}
```

## 依赖

* [ajv](https://github.com/epoberezkin/ajv)

