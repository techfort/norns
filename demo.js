(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _require = require('./index');

var set = _require.set;
var get = _require.get;
var lpush = _require.lpush;
var lpop = _require.lpop;
var lrange = _require.lrange;
var linsert = _require.linsert;
var rpop = _require.rpop;
var store = _require.store;
var stream = _require.stream;

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

setTimeout(function () {
  return console.log('store:', store);
}, 3000);

},{"./index":2}],2:[function(require,module,exports){
'use strict';

(function () {
  var stream = [],
      store = new Map();

  function setExpire(key, ms) {
    if (!ms) {
      return;
    }
    setTimeout(function () {
      store['delete'](key);
    }, ms);
  }

  function set(key, val, ms) {
    var event = {
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
    return store.get(key).length || new Error('key ' + key + ' is not a list');
  }

  function rpush(key, val) {

    var event = {
      event: 'lpush',
      key: key,
      value: val,
      when: new Date().getTime()
    };

    stream.push(event);

    var arr = store.get(key);
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

    var event = {
      event: 'rpush',
      key: key,
      value: val,
      when: new Date().getTime()
    };

    stream.push(event);

    var arr = store.get(key);

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
    var arr = store.get(key);
    if (!Array.isArray(arr)) {
      return 'key ' + key + ' is not an array';
    }
    var _end = end === -1 ? arr.length : end;
    _end = _end > arr.length ? arr.length : _end;
    return arr.splice(start, _end);
  }

  function linsert(key, beforeAfter, pivot, val) {
    var arr = store.get(key);
    if (!Array.isArray(arr)) {
      throw new Error('key ' + key + ' is not an array');
    }

    var index = arr.indexOf(pivot);
    if (index === -1) {
      throw new Error('pivot value ' + pivot + ' is not in ' + key + ' list');
    }

    arr.splice(beforeAfter === 'BEFORE' ? index : index + 1, 0, val);
    store.set(key, arr);

    return llen(key);
  }

  module.exports = {
    set: set, get: get, lpush: lpush, lpop: lpop, lrange: lrange, linsert: linsert, rpop: rpop, store: store, stream: stream
  };
})();

},{}]},{},[1]);
