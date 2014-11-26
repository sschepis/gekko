// Everything is explained here:
// https://github.com/askmike/gekko/blob/master/docs/Configuring_gekko.md

var config = {};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                          GENERAL SETTINGS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Gekko stores historical history
config.history = {
  // in what directory should Gekko store
  // and load historical data from?
  directory: './history/'
};
config.debug = false; // for additional logging / debugging

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                         WATCHING A MARKET
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Monitor the live market
config.watch = {
  enabled: true,
  exchange: 'OKCoinFutures', // 'MtGox', 'BTCe', 'Bitstamp', 'cexio' or 'kraken'
  currency: 'BTC',
  asset: 'BTC1W'
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING TRADING ADVICE
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

config.tradingAdvisor = {
  enabled: true,
  method: 'DEMA',
  candleSize: 1,
  historySize: 50
};

// Exponential Moving Averages settings:
config.DEMA = {
  // EMA weight (α)
  // the higher the weight, the more smooth (and delayed) the line
  short: 9,
  long: 27,
  // amount of candles to remember and base initial EMAs on
  // the difference between the EMAs (to act as triggers)
  thresholds: {
    down: -0.015,
    up: 0.025
  }
};

// MACD settings:
config.MACD = {
  // EMA weight (α)
  // the higher the weight, the more smooth (and delayed) the line
  short: 10,
  long: 21,
  signal: 9,
  // the difference between the EMAs (to act as triggers)
  thresholds: {
    down: -0.025,
    up: 0.025,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 1
  }
};

// PPO settings:
config.PPO = {
  // EMA weight (α)
  // the higher the weight, the more smooth (and delayed) the line
  short: 12,
  long: 26,
  signal: 9,
  // the difference between the EMAs (to act as triggers)
  thresholds: {
    down: -0.025,
    up: 0.025,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 2
  }
};

// RSI settings:
config.RSI = {
  interval: 14,
  thresholds: {
    low: 30,
    high: 70,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 1
  }
};

// custom settings:
config.custom = {
  my_custom_setting: 10
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING PLUGINS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Want Gekko to perform real trades on buy or sell advice?
// Enabling this will activate trades for the market being
// watched by config.watch
config.trader = {
  enabled: false,
  key: '2017890',
  secret: 'F127DA6608874605E57EBCA2677DB379',
  username: '' // your username, only fill in when using bitstamp or cexio
};

config.adviceLogger = {
  enabled: true
};

// do you want Gekko to calculate the profit of its own advice?
config.profitSimulator = {
  enabled: true,
  reportInCurrency: true,
  simulationBalance: {
    asset: 100,
    currency: 1
  },
  // only want report after a sell? set to `false`.
  verbose: true,
  fee: 0.06,
  slippage: 0.05
};

// want Gekko to send a mail on buy or sell advice?
config.mailer = {
  enabled: false,       // Send Emails if true, false to turn off
  sendMailOnStart: true,    // Send 'Gekko starting' message if true, not if false
  email: 'sschepis@gmail.com',    // Your Gmail address
  password: 'RamA1o8!',       // Your Gmail Password - if not supplied Gekko will prompt on startup.
  tag: '[GEKKO] ',
  server: 'smtp.gmail.com',   // The name of YOUR outbound (SMTP) mail server.
  smtpauth: true,     // Does SMTP server require authentication (true for Gmail)
  user: 'sschepis@gmail.com',       // Your Email server user name - usually your full Email address 'me@mydomain.com'
  from: 'sschepis@gmail.com',       // 'me@mydomain.com'
  to: 'sschepis@gmail.com',       // 'me@somedomain.com, me@someotherdomain.com'
  ssl: true,        // Use SSL (true for Gmail)
  port: '',       // Set if you don't want to use the default port
  tls: false        // Use TLS if true
};

config.mandrillMailer = {
  enabled: false,
  sendMailOnStart: true,
  to: '', // to email
  toName: 'Gekko user',
  from: '', // from email
  fromName: 'Gekko bot info',
  apiKey: '', // Mandrill api key
};

config.smsPlivo = {
  enabled: false,
  sendMailOnStart: true,
  smsPrefix: 'GEKKO:', // always start SMS message with this
  to: '', // your SMS number
  from: '', // SMS number to send from provided by Plivo
  authId: '', // your Plivo auth ID
  authToken: '' // your Plivo auth token
};

config.ircbot = {
  enabled: false,
  emitUpdats: false,
  channel: '#your-channel',
  server: 'irc.freenode.net',
  botName: 'gekkobot'
};

config.campfire = {
  enabled: false,
  emitUpdates: false,
  nickname: 'Gordon',
  roomId: null,
  apiKey: '',
  account: ''
};

config.redisBeacon = {
  enabled: false,
  port: 6379, // redis default
  host: '127.0.0.1', // localhost
    // On default Gekko broadcasts
    // events in the channel with
    // the name of the event, set
    // an optional prefix to the
    // channel name.
  channelPrefix: '',
  broadcast: [
    'small candle'
  ]
};

config.webserver = {
  enabled: true,
  ws: {
    host: 'localhost',
    port: 2338,
  },
  http: {
    host: 'localhost',
    port: 2339,
  }
};

// not working, leave as is
config.backtest = {
  enabled: false
};

config['I understand that Gekko only automates MY OWN trading strategies'] = true;

module.exports = config;