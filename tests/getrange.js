let test = require('tape'),
  N = require('../index'),
  ds = N(1);

test('GETRANGE', (t) => {
  ds.set('mykey', 'foobar');
  t.ok(ds.get('mykey'), 'foo');

  t.ok(ds.getrange('mykey', 1, 4), 'ooba');
  t.end();
});
