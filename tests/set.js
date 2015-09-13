let test = require('tape'),
  N = require('../index'),
  ds = N(1);

test('SET', (t) => {

  ds.set('foo', 'bar');
  t.ok(ds.get('foo'), 'bar');
  t.end();
});
