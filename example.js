let N = require('./index')(1);


N.set('foo', 'bar', 3000);
N.lpush('mylist', 'joe');
N.lpush('mylist', 'jack');
N.lpush('mylist', 'john');
console.log(N.lrange('mylist', 1, -1));
N.lpush('mylist', 'jim');
N.lpop('mylist');
N.lpush('mylist', 'jill');
N.linsert('mylist', 'BEFORE', 'john', 'QUUX!');
N.linsert('mylist', 'AFTER', 'QUUX!', 'BAR');
N.rpushx('rpushxlist', 'try and fail');
N.rpush('rpushxlist', 'try and succeed');
N.rpushx('rpushxlist', 'try and succeed again');
console.log(N.store, N.stream);
console.log(N.lrange('mylist', 0, -1));
console.log(`lindex [3]:`, N.lindex('mylist', 3));
console.log(`lindex [-2]:`, N.lindex('mylist', -2));

N.rpop('mylist');
console.log(N.store);

setTimeout(() => console.log('store:', N.store), 3000);
