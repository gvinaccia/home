const EventEmitter = require('events');
const SerialPort = require('serialport');

class Arduino extends EventEmitter {
  constructor(baudRate = 57600) {
    super();

    this.baudRate = baudRate;
    this.isConnected = false;
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

      this.port.on('open', _ => this.isConnected = true);

      this.port.on('data', (data) => {
        this.emit('data', data);
      });
    })
  }

  toggle() {
    this.sendCommand('t');
  }

  turnOn() {
    this.sendCommand('s');
  }

  turnOff() {
    this.sendCommand('o');
  }

  setTargetTemp(temp) {
    this.sendCommand('a'+temp);
  }

  sendCommand(cmd) {
    if (!this.isConnected)
      return;

    this.port.write(cmd);     
  }
}

module.exports = Arduino;