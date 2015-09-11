(() => {
  let stream = [];

  function set(store, key, val) {
    let event = {
      event: 'set',
      key: key,
      value: val,
      when: new Date().getTime()
    };
    stream.push(event);
    let newstore = Object.assign({}, store);
    newstore[key] = val;
    return newstore;
  }

  function get(store, key) {
    return store[key] || null;
  }

  function lpop(store, key) {
    return pop(store, key, 'lpop');
  }

  function rpop(store, key) {
    return pop(store, key, 'rpop');
  }

  function pop(store, key, lr) {
    let newstore = Object.assign({}, store);
    if (newstore[key] && Array.isArray(newstore[key])) {
      newstore[key][lr === 'lpop' ? 'unshift' : 'pop']();
    }
    return newstore;
  }

  function lpush(store, key, val) {
    let event = {
      event: 'lpush',
      key: key,
      value: val,
      when: new Date().getTime()
    };
    stream.push(event);
    let newstore = Object.assign({}, store);
    if (newstore[key]) {
      if (Array.isArray(newstore[key])) {
        newstore[key].push(val);
      } else {
        throw `key ${key} is not an array`;
      }
    } else {
      newstore[key] = [];
      newstore[key].push(val);
    }
    return newstore;
  }


  module.exports = {
    set, get, lpush, stream
  };

})();
