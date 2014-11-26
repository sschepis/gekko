
var OKCoin = require("okcoin-api");
var util = require('../core/util.js');
var _ = require('lodash');
var moment = require('moment');
var async = require('async');
var log = require('../core/log');

// Module-wide constants
var exchangeName = 'okcoinfutures';

var defaultAsset = 'BTCUSD';

var Trader = function(config) {
  _.bindAll(this);
  if(_.isObject(config)) {
    this.key = config.key;
    this.secret = config.secret;
  }
  this.name = 'OKCoinFutures';
  this.balance;
  this.price;

  this.okcoin = new OKCoin(this.key, this.secret);
};

// if the exchange errors we try the same call again after
// waiting 10 seconds
Trader.prototype.retry = function(method, args) {
  var wait = + moment.duration(5, 'seconds');
  log.debug(this.name, 'returned an error, retrying..');

  var self = this;

  // make sure the callback (and any other fn)
  // is bound to Trader
  _.each(args, function(arg, i) {
    if(_.isFunction(arg))
      args[i] = _.bind(arg, self);
  });

  // run the failed method again with the same
  // arguments after wait
  setTimeout(
      function() { method.apply(self, args) },
      wait
  );
};

Trader.prototype.getPortfolio = function(callback) {
  this.okcoin.futures_userinfo(function (err, data, body) {
    var o = JSON.parse(body);
    var portfolio = [];
    portfolio.push({name: 'BTC', amount: o.info.btc.balance});
    portfolio.push({name: 'LTC', amount: o.info.ltc.balance});
    callback(err, portfolio);
  });
};

Trader.prototype.getTicker = function(callback) {
  this.okcoin.futures_ticker(defaultAsset, function (err, data, body) {
    var tick = JSON.parse(body);
    callback(err, { bid: +tick.ticker.buy, ask: +tick.ticker.sell })
  });
};

// This assumes that only limit orders are being placed, so fees are the
// "maker fee" of 0.1%.  It does not take into account volume discounts.
Trader.prototype.getFee = function(callback) {
  var makerFee = 0.1;
  callback(false, makerFee / 100);
};

function submit_order(okcoin, type, amount, price, callback) {
  // TODO: Bitstamp module included the following - is it necessary?
  // amount *= 0.995; // remove fees
  amount = Math.floor(amount*100000000)/100000000;
  okcoin.new_order(defaultAsset, amount, price, exchangeName,
      type,
      'exchange limit',
      function (err, data, body) {
        if (err)
          return log.error('unable to ' + type, err, body);

        var order = JSON.parse(body);
        callback(err, order.order_id);
      });
}

Trader.prototype.buy = function(amount, price, callback) {
  submit_order(this.okcoin, 'buy', amount, price, callback);

};

Trader.prototype.sell = function(amount, price, callback) {
  submit_order(this.okcoin, 'sell', amount, price, callback);
};

Trader.prototype.checkOrder = function(order_id, callback) {
  this.okcoin.order_status(order_id, function (err, data, body) {
    var result = JSON.parse(body);
    callback(err, result.is_live);
  });
};

Trader.prototype.cancelOrder = function(order_id, callback) {
  this.okcoin.cancel_order(order_id, function (err, data, body) {
    var result = JSON.parse(body);
    if (err || !result || !result.is_cancelled)
      log.error('unable to cancel order', order, '(', err, result, ')');
  });
};

Trader.prototype.getTrades = function(since, callback, descending) {
  var self = this;

  //var start = since ? since.unix() : null;
  var process = function (err, data)  {
    var args = _.toArray(arguments);

    if (err) return self.retry(self.getTrades, args);

    if(Array.isArray(data)) {
      var trades = [];
      _.each(data, function (arg, i) {
        trades.push({
          date: arg.date / 1000,
          price: parseFloat(arg.price),
          amount: parseFloat(arg.amount),
          tid: arg.tid,
          type: arg.type
        });
      });
      callback(null, trades);
    }
    else return self.retry(self.getTrades, args);
  };

  self.okcoin.futures_trades(_.bind(process, self));
};

module.exports = Trader;

