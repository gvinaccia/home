const express = require('express');
const path = require('path');
const cron = require('node-cron');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Queue = require("./queue");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database('app.db');
const Arduino = require('./src/arduino');
const winston = require('winston');


const shouldSchedule = false;

const history = new Queue(2000);

var lastData = {};

const logger = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.File)({ filename: 'casa.log' })
  ]
});

const arduino = new Arduino(logger);

arduino.on('error', (err) => {
  console.log(err);
})

arduino.on('data', (data) => {
  try {
    lastData = JSON.parse(data);
    io.emit('datapkg', data);
  } catch (e) { }
})

arduino.connect();

app.use(express.static('public'));

if (shouldSchedule) {

  cron.schedule('30 6 * * *', () => {
    arduino.turnOn();
  });

  cron.schedule('45 7 * * *', () => {
    arduino.turnOff();
  });
/*
  cron.schedule('0 18 * * *', () => {
    arduino.turnOn();
  });

  cron.schedule('30 19 * * *', () => {
    arduino.turnOff();
  });
  */

}

cron.schedule('*/5 * * * *', () => {
  logger.log('info', 'data', lastData);
})


io.on('connection', function (socket) {
  socket.on('command', function (command) {
    switch (command.name) {
      case 'toggle':
        if (lastData.status == 1) {
          arduino.turnOff();
        } else {
          arduino.turnOn();
        }
        break;
      case 'incr':
        arduino.setTargetTemp(lastData.target + .5);
        break;
      case 'decr':
        arduino.setTargetTemp(lastData.target - .5);
        break;
    }
  });
});

http.listen(3000, "0.0.0.0", function () {
  console.log('listening on *:3000');
});