const fs = require('fs');
const path = require('path');

const logfile = path.join(__dirname, '..', 'thank.json');

function getRefills() {
  return new Promise(resolve => {
    fs.readFile(logfile, 'utf-8', (err, data) => {
      if (err) {
        return resolve([]);
      }
      resolve(JSON.parse(data));
    })
  })
}

function addRefill(date, quantity, remaining) {
  return new Promise((resolve, reject) => {
    const refill = { date, quantity, remaining };

    getRefills().then(allRefills => {
      allRefills.push(refill);

      fs.writeFile(logfile, JSON.stringify(allRefills), { encoding: 'utf-8' }, err => {
        if (err) {
          return reject(err);
        }
        resolve(allRefills);
      });  
    });

  });
}

module.exports = { getRefills, addRefill };
