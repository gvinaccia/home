const socket = io();

const $status = document.getElementById('status');
const $temp1 = document.getElementById('temp1');
const $temp2 = document.getElementById('temp2');
const $incBtn = document.getElementById('incBtn');
const $decrBtn = document.getElementById('decrBtn');
const $toggleBtn = document.getElementById('toggle');
const $target = document.getElementById('target');

let lock = false;

socket.on('datapkg', function (msg) {
    const receivedData = JSON.parse(msg);
    $status.innerHTML = (receivedData.status ? 'ON' : 'OFF');
    $temp1.innerHTML = (receivedData.temp1.toFixed(2));
    $temp2.innerHTML = (receivedData.temp2.toFixed(2));
    $target.innerHTML = (receivedData.target.toFixed(2));
    $toggleBtn.innerHTML = (receivedData.status ? 'Spegni' : 'Accendi');

    lock = false;
});

$toggleBtn.addEventListener('click', _ => {
    sendCommand({
        name: 'toggle'
    });
})

$incBtn.addEventListener('click', _ => {
    sendCommand({
        name: 'incr'
    });
});

$decrBtn.addEventListener('click', _ => {
    sendCommand({
        name: 'decr'
    });
});

function sendCommand(cmd) {
    if (lock)
        return;

    lock = true;

    socket.emit('command', cmd);
}