// 
// Current state: early prototype
// 
// todo: express maybe?
// 

// 
// Spawn a nodejs webserver
// 

var _ = require('lodash');
var async = require('async');
var config = require('../core/util').getConfig();
var express = require('express');

var serveStatic = require('serve-static');
var compression = require('compression');

// we are going to send it to web clients, remove
// potential private information
delete config.mailer;

var serverConfig = config.webserver;

//var http = require("http");

var Server = function() {
  _.bindAll(this);

  this.http = express();
  this.history = false;

  this.index;
};

Server.prototype.setup = function(next) {
  async.series(
    [
      this.setupHTTP,
      this.setupWS
    ],
    next
  );
};

Server.prototype.broadcastHistory = function(data) {
  this.history = data;
  this.broadcast({
    message: 'history',
    data: data
  });
};

Server.prototype.broadcastSmallCandle = function(candle) {
  this.broadcast({
    message: 'candle',
    data: candle
  });
};

Server.prototype.broadcastAdvice = function(advice) {
  this.broadcast({
    message: 'advice',
    data: advice
  });
};

Server.prototype.broadcastTrade = function(trade) {
  this.broadcast({
    message: 'trade',
    data: trade
  });
};

Server.prototype.setupHTTP = function(next) {
  this.http.use(compression({ threshold: 512 }));
  this.http.use(serveStatic(__dirname + '/frontend'));
  this.server = this.http.listen(serverConfig.http.port || 3000);
  next();
};

Server.prototype.clientDisconnected = function(socket) {

};

Server.prototype.clientConnected = function(socket) {
  socket.on('disconnect', this.clientDisconnected);
  this.send(socket, {message: 'welcome', data:'hello user'});
};


Server.prototype.setupWS = function(next) {
  this.io = require('socket.io')(this.server);
  this.io.on('connection', this.clientConnected);
  next();
};

Server.prototype.send = function(conn, obj) {
  conn.emit('__data', obj);
};

Server.prototype.broadcast = function(obj) {
  this.io.emit('__data', obj);
};

module.exports = Server;