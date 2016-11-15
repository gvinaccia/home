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


const history = new Queue(2000);

var lastData = {};

const arduino = new Arduino;

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

//cron.schedule('*/5 * * * * *', function() {
//    port.write('t');   
//})

io.on('connection', function (socket) {
  socket.on('command', function (command) {
    switch (command.name) {
      case 'toggle':
        arduino.toggle();
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