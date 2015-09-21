let test = require('tape'),
  N = require('../index'),
  ds = N(1);

test('GETRANGE', (t) => {
  ds.set('mykey', 'foobar');
  t.equal(ds.get('mykey'), 'foobar');

  t.equal(ds.getrange('mykey', 1, 5), 'ooba');
  t.end();
});
