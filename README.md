# ES7 async wrapper for csv package #

This is a wrapper for the popular `csv` package in NPM that can be used with the ES7 async-await pattern, instead of using callbacks.

## Documentation ##

For all documentation, please see the documentation for the [csv package](https://www.npmjs.com/package/csv).

## Usage examples ##

All parameters are the same as for the functions in the `csv` module, except that you need to omit the callback parameter.

If there is any error returned by the `csv` package, an exception will be thrown.

```js
const csv = require('async-csv');

let result1 = await csv.generate(options);
let result2 = await csv.parse(input, options);
let result3 = await csv.transform(data, handler, options); // `options` are not required
let result4 = await csv.stringify(data, options); // `options` are not required
```

## Feedback ##

Feedback, bug reports and pull requests are welcome. See the linked github repository.
