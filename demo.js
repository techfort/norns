(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var N = require('./index')(1);

N.set('foo', 'bar', 3000);
N.lpush('mylist', 'joe');
N.lpush('mylist', 'jack');
N.lpush('mylist', 'john');
console.log(N.lrange('mylist', 1, -1));
N.lpush('mylist', 'jim');
N.lpop('mylist');
N.lpush('mylist', 'jill');
N.linsert('mylist', 'BEFORE', 'john', 'QUUX!');
N.linsert('mylist', 'AFTER', 'QUUX!', 'BAR');
N.rpushx('rpushxlist', 'try and fail');
N.rpush('rpushxlist', 'try and succeed');
N.rpushx('rpushxlist', 'try and succeed again');
console.log(N.store, N.stream);
console.log(N.lrange('mylist', 0, -1));
console.log('lindex [3]:', N.lindex('mylist', 3));
console.log('lindex [-2]:', N.lindex('mylist', -2));

N.rpop('mylist');
console.log(N.store);

setTimeout(function () {
  return console.log('store:', N.store);
}, 3000);

},{"./index":2}],2:[function(require,module,exports){
'use strict';

(function () {

  function Norns(serverId) {
    var stream = [],
        store = new Map(),
        counter = 1,
        server = serverId;
    var API = {
      /**
       * Set expiration time for a key in milliseconds
       * @param {String} key - the datastore key
       * @param {Number} ms - milliseconds to expiration
       */
      setExpire: function setExpire(key, ms) {
        if (!ms || ms === -1) {
          return;
        }
        setTimeout(function () {
          store['delete'](key);
        }, ms);
      },

      logEvent: function logEvent(evtName, key) {
        for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        stream.push({
          event: evtName,
          when: new Date().getTime(),
          args: args,
          key: key,
          server: server
        });
      },

      /**
       * Sets a key in the datastore to a value and optionally sets expiration time
       * @param {String} key - the key to be set
       * @param {*} val - the value paired to the key
       * @param {Number} [ms] - optional time in milliseconds to expiration
       * @returns {*} the value set to the key
       */
      set: function set(key, val, ms) {
        var event = {
          event: 'set',
          key: key,
          args: [val, ms || -1],
          when: new Date().getTime()
        };
        stream.push(event);
        store.set(key, val);
        API.setExpire(key, ms);
        return val;
      },

      /**
       * Gets the value associated to a key
       * @param {String} key - the key in the datastore
       */
      get: function get(key) {
        return store.get(key);
      },

      /**
       * Removes a value from a list
       * @param {String} key - the key associated to the list
       * @param {String} lr - remove to the left with lpop and right with rpop
       * @returns {Number} the new length of the list
       */
      pop: function pop(key, lr) {
        if (store.get(key) && Array.isArray(store.get(key))) {
          store.get(key)[lr === 'lpop' ? 'shift' : 'pop']();
        }
        return store.get(key).length;
      },

      /**
       * Remove to the left of a list
       * @param {String} key - the key associated to the list
       * @returns {Number} the new length of the list
       */
      lpop: function lpop(key) {
        return API.pop(key, 'lpop');
      },

      /**
       * Remove to the right of a list
       * @param {String} key - the key associated to the list
       * @returns {Number} the new length of the list
       */
      rpop: function rpop(key) {
        return API.pop(key, 'rpop');
      },

      /**
       * Get length a list
       * @param {String} key - the key associated to the list
       * @returns {Number} the length of the list
       */
      llen: function llen(key) {
        return store.get(key).length || new Error('key ' + key + ' is not a list');
      },

      /**
       * Push value to the right of a list
       * @param {String} key - the key
       * @param {*} val - the value to be pushed
       * @param {boolean} [x] - only push if key exists
       * @returns {Number} new length of the list
       */
      rpush: function rpush(key, val, x) {

        var event = {
          event: 'lpush',
          key: key,
          args: [val],
          when: new Date().getTime()
        };

        stream.push(event);

        var arr = store.get(key);
        if (arr) {
          if (Array.isArray(arr)) {
            arr.push(val);
            store.set(key, arr);
          } else {
            store.set(key, [val]);
          }
        } else {
          // rpushx
          if (x) {
            return 0;
          }
          store.set(key, [val]);
        }
        return API.llen(key);
      },

      /**
       * Push value to the right of a list only if key exists
       * @param {String} key - the key
       * @param {*} val - the value to be pushed
       * @returns {Number} new length of the list
       */
      rpushx: function rpushx(key, val) {
        return API.rpush(key, val, true);
      },

      /**
       * Get value at 'index' of a list associated with a key
       * @param {String} key - the key
       * @param {Number} index - the index
       * @returns {*} the value at index 'inedx'
       */
      lindex: function lindex(key, index) {

        var arr = store.get(key),
            computedIndex = index < 0 ? arr.length + index : index;

        if (computedIndex > arr.length - 1) {
          throw new Error('Index out of range for list at key: [' + key + ']');
        }

        return arr[computedIndex];
      },

      /**
       * Push value to the left of a list
       * @param {String} key - the key
       * @param {*} val - the value to be pushed
       * @param {boolean} [x] - only push if key exists
       * @returns {Number} new length of the list
       */
      lpush: function lpush(key, val, x) {

        var arr = store.get(key);

        if (arr) {
          if (Array.isArray(arr)) {
            arr.unshift(val);
            store.set(key, arr);
          } else {
            store.set(key, [val]);
          }
        } else {
          // lpushx
          if (x) {
            return 0;
          }
          store.set(key, [val]);
        }

        var event = {
          event: 'rpush',
          key: key,
          value: val,
          when: new Date().getTime()
        };

        stream.push(event);
        return API.llen(key);
      },

      /**
       * Push value to the right of a list only if key exists
       * @param {String} key - the key
       * @param {*} val - the value to be pushed
       * @returns {Number} new length of the list
       */
      lpushx: function lpushx(key, val) {
        return API.lpush(key, val, true);
      },

      /**
       * Get a range of values in a list associated with a key
       * @param {String} key - the key
       * @param {Number} start - start index
       * @param {Number} end - end index
       * @returns {Array} the range of values
       */
      lrange: function lrange(key, start, end) {
        var arr = store.get(key);
        if (!Array.isArray(arr)) {
          return 'key ' + key + ' is not an array';
        }
        var _end = end === -1 ? arr.length : end;
        _end = _end > arr.length ? arr.length : _end;
        var copy = Object.assign([], arr);
        return copy.splice(start, _end);
      },

      /**
       * Insert a value before or after a pivot value in a list associated with key
       * @param {String} key - the key
       * @param {String} beforeAfter - 'BEFORE' or 'AFTER'
       * @param {*} pivot - pivot value
       * @returns {Number} the new length of the list
       */
      linsert: function linsert(key, beforeAfter, pivot, val) {
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

        return API.llen(key);
      },
      store: store,
      stream: stream

    };
    return API;
  }
  module.exports = Norns;
})();

},{}]},{},[1]);
