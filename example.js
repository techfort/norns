let {
  set, get, lpush, lpop, lrange, linsert, rpop, store, stream
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
console.log(store, stream);


rpop('mylist');
console.log(store);

setTimeout(() => console.log('store:', store), 3000);
