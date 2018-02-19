const socket = io();

const $status = document.getElementById('status');
const $status2 = document.getElementById('status2');
const $status3 = document.getElementById('status3');
const $temp1 = document.getElementById('temp1');
const $temp2 = document.getElementById('temp2');
const $incBtn = document.getElementById('incBtn');
const $decrBtn = document.getElementById('decrBtn');
const $toggleBtn = document.getElementById('toggle');
const $target = document.getElementById('target');

const $start1h = document.getElementById('start1');
const $start2h = document.getElementById('start2');

let lock = false;

socket.on('datapkg', function (msg) {
    const receivedData = JSON.parse(msg);
    $status.innerHTML = (receivedData.status ? 'ON' : 'OFF');
    $status2.innerHTML = receivedData.remainingTime > 0 ? receivedData.remainingTime + ' min' : '---';
    $status3.innerHTML = receivedData.schedule ? 'avvio programmato attivo' : 'nessun avvio programmato';
    $temp1.innerHTML = (receivedData.temp1.toFixed(2));
    $temp2.innerHTML = (receivedData.temp2.toFixed(2));
    $target.innerHTML = (receivedData.target.toFixed(2));
    $toggleBtn.innerHTML = (receivedData.status ? 'Spegni' : 'Accendi');

    lock = false;
});

$toggleBtn.addEventListener('click', _ => {
    sendCommand({ name: 'toggle' });
})

$incBtn.addEventListener('click', _ => {
    sendCommand({ name: 'incr' });
});

$decrBtn.addEventListener('click', _ => {
    sendCommand({ name: 'decr' });
});

$start1h.addEventListener('click', _ => {
    sendCommand({ name: 'start1' });
})

$start2h.addEventListener('click', _ => {
    sendCommand({ name: 'start2' });
})

$status3.addEventListener('click', _ => {
    sendCommand({ name: 's_toggle' });
})

function sendCommand(cmd) {
    if (lock)
        return;

    lock = true;

    socket.emit('command', cmd);
}