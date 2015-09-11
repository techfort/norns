(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _require = require('./index');

var set = _require.set;
var get = _require.get;
var lpush = _require.lpush;
var stream = _require.stream;

var store = {};

store = set(store, 'foo', 'bar');
store = lpush(store, 'mylist', 'joe');
store = lpush(store, 'mylist', 'jack');
console.log(store, stream);

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
    set: set, get: get, lpush: lpush, stream: stream
  };
})();

},{}]},{},[1]);
