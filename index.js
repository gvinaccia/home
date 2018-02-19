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


let shouldSchedule = false;

const history = new Queue(2000);

let remainingTime = 0;

var lastData = {};

const logger = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.File)({ filename: 'casa.log' })
  ]
});

const arduino = new Arduino(logger);

arduino.on('error', console.log);

arduino.on('data', (data) => {
  try {
    lastData = JSON.parse(data);
    const d = JSON.parse(data);
    d.remainingTime = remainingTime;
    d.schedule = shouldSchedule;
    io.emit('datapkg', JSON.stringify(d));
  } catch (e) { }
})

arduino.connect();

app.use(express.static('public'));

cron.schedule('30 6 * * *', () => {
  if (shouldSchedule) {
    arduino.turnOn();
  }
});

cron.schedule('45 7 * * *', () => {
  arduino.turnOff();
});

cron.schedule('*/5 * * * *', () => {
  logger.log('info', 'data', lastData);
})

var timeout;
var timeoutRef;
var intervalRef;

io.on('connection', function (socket) {
  socket.on('command', function (command) {
    switch (command.name) {
      case 'toggle':
        if (lastData.status == 1) {
          stopCycle();
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
      case 'start1':
        startCycle(60);
        break;
      case 'start2':
        startCycle(120);
        break;
      case 'start2':
        startCycle(120);
        break;
      case 's_toggle':
        shouldSchedule = !shouldSchedule;
        break;
    }
  });
});

function startCycle(time) {
  stopCycle();
  arduino.turnOn();
  remainingTime = time;
  intervalRef = setInterval(() => {
    remainingTime -= 1;
  }, 60 * 1000);
  timeoutRef = setTimeout(() => {
    stopCycle();
  }, time * 60 * 1000)
}

function stopCycle() {
  arduino.turnOff();

  if (!timeoutRef) {
    return;
  }

  clearTimeout(timeoutRef);
  clearInterval(intervalRef);
  remainingTime = 0;
}

http.listen(3000, "0.0.0.0", function () {
  console.log('listening on *:3000');
});
