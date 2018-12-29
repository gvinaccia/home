const exec = require('child_process').exec;

const input = 'rtsp://192.168.1.105:554/user=admin&password=&channel=3&stream=0.sdp?real_stream--rtp-caching=100';
const rate = 1; // Video FPS rate.
const quality = 'qvga'; // Quality of the image
const extraparams = '-b:v 32k';

module.exports = function start() {
    return exec(
        'ffmpeg -loglevel quiet -y -i \'' + input + '\' -r ' + rate + ' ' + extraparams + ' -f image2 -update 1 /tmp/_imgsnap.jpg',
        { maxBuffer: 2048 * 1024 },
        function (error, stdout, stderr) {
            if (error !== null) {
                console.error('FFmpeg\'s exec error: ' + error);
            }
        });
}
