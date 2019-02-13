'use strict';

const EventEmitter = require('events');

const VALID = 'VALID';
const RECACHE = 'RECACHE';
const INITIAL = 'INITIAL';

class TimedCache extends EventEmitter {
  constructor(time, getter) {
    super();
    this.time = time;
    this._cache = {};
    this._getter = getter;
  }

  get(item) {
    if (this._cache[item]) {
      if (Date.now() - this._cache[item].time < this.time) {
        this.emit('get', VALID, item);
        return Promise.resolve(this._cache[item].data);
      }
      this.emit('get', RECACHE, item);
      this._fetch(item);
      return Promise.resolve(this._cache[item].data);
    }
    this.emit('get', INITIAL, item);
    return this._fetch(item);
  }

  _fetch(item) {
    return this._getter(item).then((data) => {
      this._cache[item] = { time: Date.now(), data };
      return data;
    });
  }

  clear() {
    this._cache = {};
  }
}

module.exports = TimedCache;
