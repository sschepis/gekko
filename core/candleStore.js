// 
// Low level datastore to persist 1m candles
// generated by the CandleManager to disk.
//
var zlib = require('zlib');
var fs = require('fs');
var lodash = require('lodash');
var async = require('async');
var _ = require('lodash');

var config = require('./util').getConfig();

var Day = function(day) {
  this.day = day;
  this.state = "uninitialized";
  this.candles = [];
  this.filename = "history-" + day.toString() + ".csv";
}

Day.prototype.addCandles = function(candles) {
  this.candles = this.candles.concat(candles);
};

var Store = function() {
  this.directory = config.history.directory;
  this.oldDay = null;
  this.day = null;
  // This is intented to be an array of arrays. 
  this.queue = [];

  //TODO(yin): Make this mockable, or mock the fs in tests.
  // write a daily database
  this.write = async.compose(
    this.writeFile,
    this.deflate,
    this.toCSV
  );

  // read a daily database
  this.read = async.compose(
    this.toArray,
    this.unzip,
    this.readFile
  );
}

Store.prototype.openDay = function(day, callback) {
  // Load only if the open day changed, or we never opened a day
  if(this.day == null || day != this.day.day) {
    prepareNewDay(day);
    this.loadDay(function(err, candles) {
      if(!err) {
        this.day.addCandles(candles);
        this.day.state = 'open';
      }
      callback(err, candles);
    });
  }
}

Store.prototype.loadDay = function(day, callback) {
  this.read(day.filename, function(candles) {
    callback(null, candles);
  });
}

Store.prototype.prepareNewDay = function(day) {
  if(this.day.state != 'loading') {
    // Do we need to keep 
    this.day.state = 'closing';
    this.day = new Day(day);
  }
}

// Queue's candles to be added as soon as a day is loaded
Store.prototype.addCandles = function(candles) {
  //NOTE: this.queue is array of arrays.
  this.queue.push(candles);
  this.flush();
}

// If there is a day in open state, append all queued candles to it.
Store.prototype.flush = function() {
  //TODO(yin): Help, this.day.state can get easily stuck locked.
  if(this.queue.length > 0 && this.day !== null && this.day.state == 'open') {
    this.day.addCandles(_.flatten(this.queue));
    this.queue = [];
    this.day.state = 'saving';
    this.write(this.day.filename, this.day.candles, function(err) {
      this.day.state = 'open';
    })
  }
}

Store.prototype.toCSV = function(file, candles, next) {
  var csv = _.map(candles, function(properties) {
    return _.values(properties).join(',');
  }).join('\n');

  next(null, file, csv);
}

Store.prototype.deflate = function(file, csv, next) {
  zlib.deflate(csv, function(err, buffer) {
    next(err, file, buffer);
  });
}

Store.prototype.writeFile = function(file, gzip, next) {
  fs.writeFile(this.directory + file, gzip, function(err) {
    next(err);
  });
}

Store.prototype.readFile = function(file, next) {
  fs.readFile(this.directory + file, function(err, buffer) {
    next(err, buffer);
  });
}

Store.prototype.unzip = function(buffer, next) {
  zlib.unzip(buffer, function(err, buffer) {
    next(err, buffer.toString());
  });
}

Store.prototype.toArray = function(csv, next) {
  var f = parseFloat;
  var i = parseInt;
  var obj = _.map(csv.toString().split('\n'), function(l) {
    l = l.split(',');
    return {
      s: i(l[0]),
      o: f(l[1]),
      h: f(l[2]),
      l: f(l[3]),
      c: f(l[4]),
      p: f(l[5])
    }
  });

  next(obj);
}

//TODO(yin):Exported for tests
Store.Day = Day;

module.exports = Store;