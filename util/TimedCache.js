// const EventEmitter = require('events');

// class TimedCache extends EventEmitter {
class TimedCache {
  constructor(time, getter) {
    // super();
    this.time = time;
    this._cache = {};
    this._getter = getter;
  }

  get(item) {
    if (this._cache[item] && Date.now() - this._cache[item].time < this.time) {
      // this.emit('get', item, true);
      return Promise.resolve(this._cache[item].data);
    } else {
      // this.emit('get', item, false);
      return this._getter(item).then((data) => {
        this._cache[item] = { time: Date.now(), data };
        return data;
      });
    }
  }

  clear() {
    this._cache = {};
  }
}

module.exports = TimedCache;
