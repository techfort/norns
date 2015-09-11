(() => {
  let stream = [],
    store = new Map();

  function setExpire(key, ms) {
    if (!ms) {
      return;
    }
    setTimeout(() => {
      store.delete(key);
    }, ms);
  }

  function set(key, val, ms) {
    let event = {
      event: 'set',
      key: key,
      value: val,
      when: new Date().getTime()
    };
    stream.push(event);
    store.set(key, val);
    setExpire(key, ms);
    return val;
  }

  function get(key) {
    return store.get(key);
  }

  function pop(key, lr) {
    if (store.get(key) && Array.isArray(store.get(key))) {
      store.get(key)[lr === 'lpop' ? 'shift' : 'pop']();
    }
    return store.get(key).length;
  }

  function lpop(key) {
    return pop(key, 'lpop');
  }

  function rpop(key) {
    return pop(key, 'rpop');
  }

  function llen(key) {
    return store.get(key).length || new Error(`key ${key} is not a list`);
  }

  function rpush(key, val) {

    let event = {
      event: 'lpush',
      key: key,
      value: val,
      when: new Date().getTime()
    };

    stream.push(event);

    let arr = store.get(key);
    if (arr) {
      if (Array.isArray(arr)) {
        store.set(key, arr.push(val));
      } else {
        store.set(key, [val]);
      }
    } else {
      store.set(key, [val]);
    }
    return llen(key);
  }

  function lpush(key, val) {

    let event = {
      event: 'rpush',
      key: key,
      value: val,
      when: new Date().getTime()
    };

    stream.push(event);

    let arr = store.get(key);

    if (arr) {
      if (Array.isArray(arr)) {
        arr.unshift(val);
        store.set(key, arr);
      } else {
        store.set(key, [val]);
      }
    } else {
      store.set(key, [val]);
    }

    return llen(key);
  }

  function lrange(key, start, end) {
    let arr = store.get(key);
    if (!Array.isArray(arr)) {
      return `key ${key} is not an array`;
    }
    let _end = end === -1 ? arr.length : end;
    _end = _end > arr.length ? arr.length : _end;
    return arr.splice(start, _end);
  }

  function linsert(key, beforeAfter, pivot, val) {
    let arr = store.get(key);
    if (!Array.isArray(arr)) {
      throw new Error(`key ${key} is not an array`);
    }

    let index = arr.indexOf(pivot);
    if (index === -1) {
      throw new Error(`pivot value ${pivot} is not in ${key} list`);
    }

    arr.splice(beforeAfter === 'BEFORE' ? index : index + 1, 0, val);
    store.set(key, arr);

    return llen(key);
  }

  module.exports = {
    set, get, lpush, lpop, lrange, linsert, rpop, store, stream
  };

})();
