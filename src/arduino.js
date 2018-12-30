const EventEmitter = require('events');
const SerialPort = require('serialport');

class Arduino extends EventEmitter {
  constructor(logger, baudRate = 57600) {
    super();
    
    this.baudRate = baudRate;
    this.isConnected = false;
    this.logger = logger;
  }
  
  connect() {
    SerialPort.list((err, ports) => {
      let portName;
      ports.forEach(port => {
        if (port.manufacturer == 'FTDI')
        portName = port.comName;
      })
      
      if (portName == null) {
        this.emit('error', "Arduino non trovato");
        return;
      }
      
      this.port = new SerialPort(portName, {
        baudRate: this.baudRate,
        parser: SerialPort.parsers.readline('\n')
      });
      
      this.port.on('open', () => {
        this.isConnected = true;
        this.logger.log('info', 'connect');
      });
      
      this.port.on('data', data => {
        this.emit('data', data);
      });
    })
  }
  
  toggle() {
    this.logger.log('info', 'toggling');
    this.sendCommand('t');
  }
  
  turnOn() {
    this.logger.log('info', 'turn-on');
    this.sendCommand('s');
  }
  
  turnOff() {
    this.logger.log('info', 'turn-off');
    this.sendCommand('o');
  }
  
  setTargetTemp(temp) {
    this.sendCommand('a' + temp);
  }

  openGate() {
    this.logger.log('info', 'open-gate');
    this.sendCommand('g');
  }
  
  sendCommand(cmd) {
    if (!this.isConnected)
    return;
    
    this.port.write(cmd);
  }
}

module.exports = Arduino;