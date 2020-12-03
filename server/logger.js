/* eslint-disable */
const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const moment = require('moment');

function timeStampFormat() {
  return moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ')
}

const logger = new (winston.Logger)({
  transports: [
    new (winstonDaily)({
      name: 'info-file',
      filename: './logs/app',
      datePattern: '_yyyy-MM-dd.log',
      colorize: false,
      maxsize: 50000000,
      maxFiles: 1000,
      level: 'info',
      showLevel: true,
      json: false,
      timestamp: timeStampFormat
    }),
    new (winston.transports.Console)({
      name: 'debug-console',
      colorize: true,
      level: 'debug',
      showLevel: true,
      json: false,
      timestamp: timeStampFormat
    })
  ],
  exceptionHandlers: [
    new (winstonDaily)({
      name: 'exception-file',
      filename: './logs/app-exception',
      datePattern: '_yyyy-MM-dd.log',
      colorize: false,
      maxsize: 50000000,
      maxFiles: 1000,
      level: 'error',
      showLevel: true,
      json: false,
      timestamp: timeStampFormat
    }),
    new (winston.transports.Console)({
      name: 'exception-console',
      colorize: true,
      level: 'debug',
      showLevel: true,
      json: false,
      timestamp: timeStampFormat
    })
  ]
});

const emailLogger = new (winston.Logger)({
  transports: [
    new (winstonDaily)({
      name: 'email-sent-file',
      filename: './logs/emailSent',
      datePattern: '_yyyy-MM-dd.log',
      timestamp: timeStampFormat,
      level: 'info',
      json: false,
      maxsize: 50000000,
      maxFiles: 1000,
      prettyPrint: true,
    })
  ]
});

const signUpLoginLogger = new (winston.Logger)({
  transports: [
    new (winstonDaily)({
      name: 'signUpLogin-file',
      filename: './logs/signUpLogin',
      datePattern: '_yyyy-MM-dd.log',
      timestamp: timeStampFormat,
      level: 'info',
      json: false,
      maxsize: 50000000,
      maxFiles: 1000,
      prettyPrint: true,
    })
  ]
});

module.exports = {
  logger: logger,
  emailLogger: emailLogger,
  signUpLoginLogger: signUpLoginLogger,
}
