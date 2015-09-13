let test = require('tape'),
  N = require('../index'),
  ds = N(1);

test('LPUSH', (t) => {
  ds.lpush('mylist', 'first');
  t.ok(ds.get('mylist'), ['first']);
  t.end();
});
