(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _require = require('./index');

var set = _require.set;
var get = _require.get;
var lpush = _require.lpush;
var lpop = _require.lpop;
var rpop = _require.rpop;
var stream = _require.stream;

var store = {};

store = set(store, 'foo', 'bar');
store = lpush(store, 'mylist', 'joe');
store = lpush(store, 'mylist', 'jack');
store = lpush(store, 'mylist', 'jim');
store = lpush(store, 'mylist', 'jill');
console.log(store, stream);

store = lpop(store, 'mylist');
store = rpop(store, 'mylist');
console.log(store);

},{"./index":2}],2:[function(require,module,exports){
'use strict';

(function () {
  var stream = [];

  function set(store, key, val) {
    var event = {
      event: 'set',
      key: key,
      value: val,
      when: new Date().getTime()
    };
    stream.push(event);
    var newstore = Object.assign({}, store);
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
    var newstore = Object.assign({}, store);
    if (newstore[key] && Array.isArray(newstore[key])) {
      newstore[key][lr === 'lpop' ? 'shift' : 'pop']();
    }
    return newstore;
  }

  function lpush(store, key, val) {
    var event = {
      event: 'lpush',
      key: key,
      value: val,
      when: new Date().getTime()
    };
    stream.push(event);
    var newstore = Object.assign({}, store);
    if (newstore[key]) {
      if (Array.isArray(newstore[key])) {
        newstore[key].push(val);
      } else {
        throw 'key ' + key + ' is not an array';
      }
    } else {
      newstore[key] = [];
      newstore[key].push(val);
    }
    return newstore;
  }

  module.exports = {
    set: set, get: get, lpush: lpush, lpop: lpop, rpop: rpop, stream: stream
  };
})();

},{}]},{},[1]);
