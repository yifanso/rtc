let audioSource = document.querySelector('select#audioSource');
let audioOutput = document.querySelector('select#audioOutput');
let videoSource = document.querySelector('select#videoSource');

//视频效果标签
let filtersSelect = document.querySelector('select#filter');

//用于拍照的btn和显示截取快照的图片
let snapshort = document.querySelector('button#snapshort');
let picture = document.querySelector('canvas#picture');
picture.width = 320;
picture.height = 240;

//用于显示视频流参数信息
let divConstraints = document.querySelector('div#constraints');

//获取到video标签
let videotape = document.querySelector('video#player');

//录制相关
let received = document.querySelector('video#recplayer');
let btnRecord = document.querySelector('button#record');
let btnPlay = document.querySelector('button#recplay');
let btnDownload = document.querySelector('button#download');

let buffer;
let mediaRecorder;

//将流赋值给video标签
function gotMediaStream(stream) {
    videotape.srcObject = stream;
    //视频的所有轨
    let videoTrack = stream.getVideoTracks()[0];
    let videoConstraints = videoTrack.getSettings();

    divConstraints.textContent = JSON.stringify(videoConstraints, null, 2);
    window.stream = stream;
    return navigator.mediaDevices.enumerateDevices();
}

//打印错误日志
function handleError(err) {
    console.log('getUserMedia error : ', err);
}

//设备信息数组
function gotDevices(deviceInfos) {

    deviceInfos.forEach(function (deviceinfo) {
        var option = document.createElement('option');
        option.text = deviceinfo.label;
        option.value = deviceinfo.deviceId;

        if (deviceinfo.kind == 'audioinput') {
            audioSource.appendChild(option);
        } else if (deviceinfo.kind === 'audiooutput') {
            audioOutput.appendChild(option);
        } else if (deviceinfo.kind === 'videoinput') {
            videoSource.appendChild(option);
        }
    })
}

function start() {

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        console.log('getUserMedia is not supported');
        return;
    } else {
        var deviceId = videoSource.value;
        var constraints = {
            video: {
                //修改视频宽高
                width: 320,
                height: 240,

                //设置帧率
                frameRate: 15,
                facingMode: 'enviroment',
                deviceId: deviceId ? {exact: deviceId} : undefined
            },
            audio: false
        }

        navigator.mediaDevices.getDisplayMedia(constraints)
            .then(gotMediaStream)
            .then(gotDevices)
            .catch(handleError)
    }

}

start();


//每次选择时，都会触发start函数
videoSource.onchange = start

filtersSelect.onchange = function () {
    //获取css名字
    videotape.className = filtersSelect.value;
}

//截取快照事件
snapshort.onclick = function () {
    picture.className = filtersSelect.value;
    picture.getContext('2d').drawImage(videotape, 0, 0, picture.width, picture.height);
}

function handleDataAvailable(e) {
    if (e && e.data && e.data.size > 0) {
        buffer.push(e.data);
    }
}

function startRecord() {
    buffer = [];
    var options = {
        mimeType: 'video/webm; codecs = vp8'
    }

    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error('${options.mimeType} is not supported!');
        return;
    }

    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
        console.error('Failed to create MediaRecorder:', e);
        return
    }
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10);
}

function stopRecord() {
    mediaRecorder.stop();
}

//录制按钮监听
btnRecord.onclick = () => {
    if (btnRecord.textContent === 'Start Record') {
        startRecord();
        btnRecord.textContent = 'Stop Record';
        btnPlay.disabled = true;
        btnDownload.disabled = true;
    } else {
        stopRecord();
        btnRecord.textContent = 'Start Record';
        btnPlay.disabled = false;
        btnDownload.disabled = false;
    }
}

//播放按钮监听
btnPlay.onclick = () => {
    let blob = new Blob(buffer, {type: 'video/webm'});
    received.src = window.URL.createObjectURL(blob);
    received.srcObject = null;
    received.controls = true;
    received.play();
}

//下载按钮监听
btnDownload.onclick = () => {
    let blob = new Blob(buffer, {type: 'video/webm'});
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');

    a.href = url;
    a.style.display = 'none';
    a.download = 'aaa.webm';
    a.click();
}
