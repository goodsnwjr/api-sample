'use strict';
require('dotenv').config();

const logger = require('./logger').logger;
const ilog = require('./logger').ilog;
const loopback = require('loopback');
const boot = require('loopback-boot');

var app = (module.exports = loopback());

app.start = function () {
  // start the web server
  return app.listen(33366, function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    logger.info('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      logger.info('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  app.use(
    loopback.token({
      model: app.models.accessToken,
    }),
  );

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.io = require('socket.io')(app.start(), {
      pingTimeout: 60000,
    });

    app.io.on('connection', (socket) => {
      socket.on('authentication', (userAccessToken) => {
        const AccessToken = app.models.AccessToken;

        AccessToken.findOne({
          where: {
            _id: userAccessToken,
          },
        }).then(({ userId }) => {
          socket.join(userId.toString());
        });
      });

      socket.on('log', (message) => {
        if (message.optionName) {
          ilog.info({
            remoteAddress: socket.request.socket.remoteAddress,
            uuid: message.uuid,
            action: message.action,
            userAgent: socket.request.headers['user-agent'],
            productId: message.productId,
            optionName: message.optionName,
            id: message.id,
            storeName: message.storeName,
          });
        } else {
          ilog.info({
            remoteAddress: socket.request.socket.remoteAddress,
            uuid: message.uuid,
            action: message.action,
            userAgent: socket.request.headers['user-agent'],
            productId: message.productId,
            id: message.id,
            storeName: message.storeName,
          });
        }
      });
    });
  }
});
