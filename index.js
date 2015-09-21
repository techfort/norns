(() => {

  function Norns(serverId) {
    let stream = [],
      store = new Map(),
      counter = 1,
      server = serverId;
    const API = {

      /**
       * Sets a key in the datastore to a value and optionally sets expiration time
       * @param {String} key - the key to be set
       * @param {*} val - the value paired to the key
       * @param {Number} [ms] - optional time in milliseconds to expiration
       * @returns {*} the value set to the key
       */
      set: (key, val, ms) => {
        API.logEvent('set', key, [val, ms || -1]);
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
       * get range between start and end of value stored at key
       * @param {String} key - the key in the datastore
       * @param {Number} start - start index
       * @param {Number} end - end index
       * @returns {String} substring between start and end
       */
      getrange: (key, start, end) => {
        let value = store.get(key),
          computedEnd = end < 0 ? (value.length - end) : end;
        return value ? value.substring(start, computedEnd) : '';
      },

      /**
       * Append a value to an existing key
       * @param {String} key - the key in the datastore
       * @param {String} value - the value to append
       * @returns {Number} the new length of the value
       */
      append: (key, val) => {
        let value = store.get(key),
          len = value ? 0 : (value + val).length;
        if (value) {
          store.set(key, '' + value + val);
        }
        return len;
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
          API.logEvent(lr, key, []);
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
       * Push value either to the left or right of a list
       * Don't use this directly, use lpush or rpush
       *
       * @param {String} key - the key
       * @param {*} val - the value to be pushed
       * @param {boolean} [x] - only push if key exists
       * @returns {Number} new length of the list
       */
      push: (dir, key, val, x) => {
        let arr = store.get(key);

        if (arr) {
          if (Array.isArray(arr)) {
            API.logEvent(dir, key, [val, x || false]);
            arr[dir === 'lpush' ? 'unshift' : 'push'](val);
            store.set(key, arr);
          } else {
            API.logEvent(dir, key, [val, x || false]);
            store.set(key, [val]);
          }
        } else {
          // lpushx
          if (x) {
            return 0;
          }
          store.set(key, [val]);
        }

        return API.llen(key);
      },

      /**
       * Push value to the left of a list
       * @param {String} key - the key
       * @param {*} val - the value to be pushed
       * @param {boolean} [x] - only push if key exists
       * @returns {Number} new length of the list
       */
      lpush: (key, val) => {
        return API.push('lpush', key, val, false);
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
       * Push value to the right of a list
       * @param {String} key - the key
       * @param {*} val - the value to be pushed
       * @param {boolean} [x] - only push if key exists
       * @returns {Number} new length of the list
       */
      rpush: (key, val) => {
        return API.push('rpush', key, val, false);
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

      /**
       * Logs the event.
       */
      logEvent: (evtName, key, ...args) => {
        stream.push({
          event: evtName,
          when: new Date().getTime(),
          args: args,
          key: key,
          server: server,
          id: counter
        });
        counter += 1;
      },

      /**
       * method to re-apply loaded events to the store
       */
      applyEvent: (event) => {
        let args = [key];
        args.push(event.args);
        API[event.event].apply(null, args);
      },

      /**
       * method to load the json of a stream dump
       */
      loadStream: (json) => {
        stream = JSON.parse(json);
        stream.forEach((event) => {

        });
      },
      store: store,
      stream: stream
    };
    return API;
  }
  module.exports = Norns;

})();
