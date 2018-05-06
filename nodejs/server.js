'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');

const logger = require('./log');
var app = require('../app');

const ipaddress = process.env.IP_ADDRESS || '127.0.0.1';
const port = process.env.EXPRESS_PORT || 8997;
var server;

// Create HTTP(S) server.
if (!process.env.SSL) {
  server = http.createServer(app);
} else {
  var privateKey  = fs.readFileSync('./key.pem', 'utf8');
  var certificate = fs.readFileSync('./cert.pem', 'utf8');
  var credentials = { key: privateKey, cert: certificate };

  server = https.createServer(credentials, app);
}

// Listen on provided port
server.listen(port, ipaddress, function () {
  logger.warn('%s: Node server started on %s:%d ...', Date(Date.now()), ipaddress, port);
});

// Event listener for HTTP server "error" event.
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

server.on('error', onError);
