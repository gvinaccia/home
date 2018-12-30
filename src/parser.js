const fs = require('fs');
const path = require('path');
const readline = require('readline');

module.exports = function() {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: fs.createReadStream(path.join(__dirname, '..', 'casa.log')),
      crlfDelay: Infinity
    });
    
    const machine = {
      onts: null,
      isOn: false
    }
    
    const sums = {
      byYear:  {},
      byMonth: {},
      byDay:   {}
    }
    
    rl.on('line', line => {
      try {
        const obj = JSON.parse(line);
        
        if (!obj || obj.message !== 'data') {
          return;
        }
    
        switch (obj.status) {
          case 0:
            if (machine.isOn) {
              const delta = new Date(obj.timestamp) - machine.onts;
              const deltaM = Math.round((delta / 1000) / 60);
    
              const yearK = machine.onts.getFullYear();
              const monthK = yearK + '-' + (machine.onts.getMonth() + 1);
              const dayK = monthK + '-' + machine.onts.getDate();
    
              if (typeof sums.byYear[yearK] === 'undefined') {
                sums.byYear[yearK] = 0;
              }
              if (typeof sums.byMonth[monthK] === 'undefined') {
                sums.byMonth[monthK] = 0;
              }
              if (typeof sums.byDay[dayK] === 'undefined') {
                sums.byDay[dayK] = 0;
              }
    
              sums.byYear[yearK] += deltaM;
              sums.byMonth[monthK] += deltaM;
              sums.byDay[dayK] += deltaM;
    
              machine.isOn = false;
              machine.onts = null;
            }
            break;
          case 1:
            if (!machine.isOn) {
              machine.onts = new Date(obj.timestamp);
              machine.isOn = true;
            }
            break;
          default:
        }
      } catch (e) { }
    });
    
    rl.on('close', () => resolve(sums));
    
  });
}