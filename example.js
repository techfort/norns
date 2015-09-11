let {
  set, get, lpush, lpop, rpop, stream
} = require('./index');

let store = {};

store = set(store, 'foo', 'bar');
store = lpush(store, 'mylist', 'joe');
store = lpush(store, 'mylist', 'jack');
store = lpush(store, 'mylist', 'jim');
store = lpush(store, 'mylist', 'jill');
console.log(store, stream);

store = lpop(store, 'mylist');
store = rpop(store, 'mylist');
console.log(store);
