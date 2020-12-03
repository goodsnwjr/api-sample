'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');

// express
const app = express();
app.use(express.static(path.join(__dirname, 'client')));

app.listen(52336, function () {
  console.log('ws started: 52336');
})

// stop
function graceful() {
  process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT' , graceful);