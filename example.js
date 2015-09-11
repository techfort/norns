let {
  set, get, lpush, stream
} = require('./index');

let store = {};

store = set(store, 'foo', 'bar');
store = lpush(store, 'mylist', 'joe');
store = lpush(store, 'mylist', 'jack');
console.log(store, stream);
