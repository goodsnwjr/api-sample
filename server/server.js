'use strict';
require('dotenv').config();

const logger = require('./logger').logger;
const loopback = require('loopback');
const boot = require('loopback-boot');
const path = require('path');

var app = (module.exports = loopback());

app.start = function() {
  // start the web server
  return app.listen(process.env.GW_API_PORT, function() {
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
boot(app, __dirname, function(err) {
  if (err) throw err;

  app.use(
    loopback.token({
      model: app.models.accessToken
    })
  );

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.start();
  }
});
