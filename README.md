# mongoose-will-paginate
> Pagination plugin for [Mongoose](http://mongoosejs.com)

[![NPM version](https://img.shields.io/npm/v/mongoose-will-paginate.svg)](https://npmjs.org/package/mongoose-will-paginate)
## **Note:** This plugin will only work with Node.js >= 4.2 and Mongoose >= 5.2
## Installation

```sh
npm install mongoose-will-paginate
```
## Usage

Add plugin to a schema and then use model `paginate` method:

```js
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-will-paginate');

var schema = new mongoose.Schema({ /* schema definition */ });
schema.plugin(mongoosePaginate);

var Model = mongoose.model('Model',  schema); // Model.paginate()
```

### Model.paginate([query], [options], [callback])

**Parameters**

* `[query]` {Object} - Query criteria. [Documentation](https://docs.mongodb.org/manual/tutorial/query-documents)
* `[options]` {Object}
  - `[select]` {Object | String} - Fields to return (by default returns all fields). [Documentation](http://mongoosejs.com/docs/api.html#query_Query-select)
  - `[sort]` {Object | String} - Sort order. [Documentation](http://mongoosejs.com/docs/api.html#query_Query-sort)
  - `[populate]` {Array | Object | String} - Paths which should be populated with other documents. [Documentation](http://mongoosejs.com/docs/api.html#query_Query-populate)
  - `[lean=false]` {Boolean} - Should return plain javascript objects instead of Mongoose documents?  [Documentation](http://mongoosejs.com/docs/api.html#query_Query-lean)
  - `[leanWithId=true]` {Boolean} - If `lean` and `leanWithId` are `true`, adds `id` field with string representation of `_id` to every document
  - `[offset=0]` {Number} - Use `offset` or `page` to set skip position
  - `[page=1]` {Number}
  - `[limit=10]` {Number}
* `[callback(err, result)]` - If specified the callback is called once pagination results are retrieved or when an error has occurred

**Return value**

Promise fulfilled with object having properties:
* `docs` {Array} - Array of documents
* `total` {Number} - Total number of documents in collection that match a query
* `limit` {Number} - Limit that was used
* `[page]` {Number} - Only if specified or default `page`/`offset` values were used
* `[pages]` {Number} - Only if `page` specified or default `page`/`offset` values were used
* `[offset]` {Number} - Only if specified or default `page`/`offset` values were used
