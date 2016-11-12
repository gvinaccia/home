var SerialPort = require("serialport");
var express = require('express');
var path = require('path');
var cron = require('node-cron');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = new SerialPort("/dev/ttyUSB0", {
  baudRate: 57600,
  parser: SerialPort.parsers.readline('\n')
});

lastData = {};

port.on('data', function(data) {
    try {
        lastData = JSON.parse(data);
        io.emit('datapkg', data);
    } catch (e) {}
});


//cron.schedule('*/5 * * * * *', function() {
//    port.write('t');   
//})

app.get('/', function(req, res) {
     res.sendFile(path.join(__dirname+'/index.html'));
})


app.get('/sw.js', function(req, res) {
     res.sendFile(path.join(__dirname+'/sw.js'));
})

app.get('/main.css', function(req, res) {
     res.sendFile(path.join(__dirname+'/main.css'));
})


app.get('/manifest.json', function(req, res) {
     res.sendFile(path.join(__dirname+'/manifest.json'));
})

app.use(express.static('images'));


io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('command', function(command) {
    port.write('t');
  });
});

http.listen(3000, "0.0.0.0", function(){
  console.log('listening on *:3000');
});