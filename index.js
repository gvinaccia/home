const express = require('express');
const path = require('path');
const cron = require('node-cron');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const winston = require('winston');
const fs = require('fs');

const Arduino = require('./src/arduino');
const streamer = require('./src/streamer');
const parser = require('./src/parser');
const thank = require('./src/thank');

let shouldSchedule = false;
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

arduino.on('data', data => {
  try {
    lastData = JSON.parse(data);
    const d = JSON.parse(data);
    d.remainingTime = remainingTime;
    d.schedule = shouldSchedule;
    io.emit('datapkg', JSON.stringify(d));
  } catch (e) { 
    console.error(e);
  }
});

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

var timeoutRef;
var intervalRef;

var pstream;

io.on('connection', function (socket) {
  if (pstream == undefined) {
    pstream = streamer();
  }
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

    switch (command.type) {
      case 'turn_on':
        if (command.payload.minutes) {
          startCycle(command.payload.minutes);
        } else {
          arduino.turnOn();
        }
        break;
      case 'turn_off':
        stopCycle();
        break;
      case 'getcam':
        fs.readFile('/tmp/_imgsnap.jpg',
          function (err, content) {
            if (err) {
            } else {
              socket.volatile.emit('cam1', {
                data: content.toString('base64')
              });
            }
          });
        break;
      case 'boiler_stats':
        parser().then(data => socket.emit('boiler_stats_response', data));
        break;
      case 'get_thank_refills':
        thank.getRefills().then(data => socket.emit('thank_refills', data));
        break;
      case 'add_thank_refill':
        thank.addRefill(
          command.payload.date,
          command.payload.quantity,
          command.payload.remaining
        ).then(data => socket.emit('thank_refills', data));
        break;
      case 'remove_thank_refill':
        thank.removeRefill(command.payload.id)
          .then(data => socket.emit('thank_refills', data));
          break;
      case 'open_gate':
        arduino.openGate();
        break;
    }
  });
});

function startCycle(time) {
  stopCycle();
  arduino.turnOn();
  remainingTime = time;
  intervalRef = setInterval(() => remainingTime -= 1, 60 * 1000);
  timeoutRef = setTimeout(() => stopCycle(), time * 60 * 1000);
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

http.listen(3000, "0.0.0.0", () => console.log('listening on *:3000'));
