let {
  set, get, lindex, lpush, lpushx, lpop, lrange, linsert, rpop, rpush, rpushx, store, stream
} = require('./index');


set('foo', 'bar', 3000);
lpush('mylist', 'joe');
lpush('mylist', 'jack');
lpush('mylist', 'john');
console.log(lrange('mylist', 1, -1));
lpush('mylist', 'jim');
lpop('mylist');
lpush('mylist', 'jill');
linsert('mylist', 'BEFORE', 'john', 'QUUX!');
linsert('mylist', 'AFTER', 'QUUX!', 'BAR');
rpushx('rpushxlist', 'try and fail');
rpush('rpushxlist', 'try and succeed');
rpushx('rpushxlist', 'try and succeed again');
console.log(store, stream);
console.log(lrange('mylist', 0, -1));
console.log(`lindex [3]:`, lindex('mylist', 3));
console.log(`lindex [-2]:`, lindex('mylist', -2));

rpop('mylist');
console.log(store);

setTimeout(() => console.log('store:', store), 3000);
