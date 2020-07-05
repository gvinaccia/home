const EventEmitter = require('events');

const Gpio = require('onoff').Gpio;

class Arduino extends EventEmitter {
  constructor(logger) {
    super();
    
    this.logger = logger;
    this.relay = new Gpio(17, 'out');
    this.gate  = new Gpio(27, 'out');

    process.on('SIGINT', _ => {
      this.relay.unexport();
    });
  }

  connect() {
    setInterval(() => {
      this.emit('data', JSON.stringify({
        temp1: 20.0,
        temp2: 20.0,
        status: this.relay.readSync(),
        target: 22,
        message: "data",
      }));
    }, 1000);
  }

  toggle() {
    this.logger.log('info', 'toggling');
    this.relay.writeSync(this.relay.readSync()^1);
  }
  
  turnOn() {
    this.logger.log('info', 'turn-on');
    this.relay.writeSync(1);
  }
  
  turnOff() {
    this.logger.log('info', 'turn-off');
    this.relay.writeSync(0);
  }
  
  setTargetTemp(temp) {}

  openGate() {
    this.gate.writeSync(1);
    setTimeout(() => {
      this.gate.writeSync(0);
    }, 500);
  }
}

module.exports = Arduino;
