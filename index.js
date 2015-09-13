(() => {

  function Norns(serverId) {
    let stream = [],
      store = new Map(),
      counter = 1,
      server = serverId;
    const API = {
      /**
       * Set expiration time for a key in milliseconds
       * @param {String} key - the datastore key
       * @param {Number} ms - milliseconds to expiration
       */
      setExpire: (key, ms) => {
        if (!ms || ms === -1) {
          return;
        }
        setTimeout(() => {
          store.delete(key);
        }, ms);
      },

      logEvent: (evtName, key, ...args) => {
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
      set: (key, val, ms) => {
        let event = {
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
      get: (key) => {
        return store.get(key);
      },

      /**
       * Removes a value from a list
       * @param {String} key - the key associated to the list
       * @param {String} lr - remove to the left with lpop and right with rpop
       * @returns {Number} the new length of the list
       */
      pop: (key, lr) => {
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
      lpop: (key) => {
        return API.pop(key, 'lpop');
      },

      /**
       * Remove to the right of a list
       * @param {String} key - the key associated to the list
       * @returns {Number} the new length of the list
       */
      rpop: (key) => {
        return API.pop(key, 'rpop');
      },

      /**
       * Get length a list
       * @param {String} key - the key associated to the list
       * @returns {Number} the length of the list
       */
      llen: (key) => {
        return store.get(key).length || new Error(`key ${key} is not a list`);
      },

      /**
       * Push value to the right of a list
       * @param {String} key - the key
       * @param {*} val - the value to be pushed
       * @param {boolean} [x] - only push if key exists
       * @returns {Number} new length of the list
       */
      rpush: (key, val, x) => {

        let event = {
          event: 'lpush',
          key: key,
          args: [val],
          when: new Date().getTime()
        };

        stream.push(event);

        let arr = store.get(key);
        if (arr) {
          if (Array.isArray(arr)) {
            arr.push(val)
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
      rpushx: (key, val) => {
        return API.rpush(key, val, true);
      },

      /**
       * Get value at 'index' of a list associated with a key
       * @param {String} key - the key
       * @param {Number} index - the index
       * @returns {*} the value at index 'inedx'
       */
      lindex: (key, index) => {

        let arr = store.get(key),
          computedIndex = index < 0 ? (arr.length + index) : index;

        if (computedIndex > arr.length - 1) {
          throw new Error(`Index out of range for list at key: [${key}]`);
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
      lpush: (key, val, x) => {

        let arr = store.get(key);

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

        let event = {
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
      lpushx: (key, val) => {
        return API.lpush(key, val, true);
      },

      /**
       * Get a range of values in a list associated with a key
       * @param {String} key - the key
       * @param {Number} start - start index
       * @param {Number} end - end index
       * @returns {Array} the range of values
       */
      lrange: (key, start, end) => {
        let arr = store.get(key);
        if (!Array.isArray(arr)) {
          return `key ${key} is not an array`;
        }
        let _end = end === -1 ? arr.length : end;
        _end = _end > arr.length ? arr.length : _end;
        let copy = Object.assign([], arr);
        return copy.splice(start, _end)
      },

      /**
       * Insert a value before or after a pivot value in a list associated with key
       * @param {String} key - the key
       * @param {String} beforeAfter - 'BEFORE' or 'AFTER'
       * @param {*} pivot - pivot value
       * @returns {Number} the new length of the list
       */
      linsert: (key, beforeAfter, pivot, val) => {
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

        return API.llen(key);
      },
      store: store,
      stream: stream
    };
    return API;
  }
  module.exports = Norns;

})();
