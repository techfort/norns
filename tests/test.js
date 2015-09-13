let test = require('tape'),
  N = require('../index');

test('Setting key works', (t) => {
  let ds = N(1);
  ds.set('foo', 'bar');
  t.equal(ds.get('foo'), 'bar');
});
