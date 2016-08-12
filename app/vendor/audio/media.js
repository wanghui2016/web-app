/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// Put variables in global scope to make them available to the browser console.
//sampleRate: 44100, sampleSize: 196000, channelCount: 1，这个是音频的设置
var audio = document.getElementById('myaudio');
var mic;
var audioContext;
var analyser;
var recorder;
console.log(process.version)
var ffmpegProcess = require('./ffmpeg-lib-node')
var audioEngine = ffmpegProcess.createNewFFmpegEngine();

audioEngine.startRecord("sss");

var constraints = window.constraints = {
  audio: {sampleRate: 44100, channelCount: 2, sampleSize: 2},
  video: false
};

function handleSuccess(stream) {

  var audioTracks = stream.getAudioTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using audio device: ' + audioTracks[0].label);

  audioContext  = new (window.AudioContext || window.webkitAudioContext);
  //var context   ＝ new window.AudioContext();
  mic = audioContext.createMediaStreamSource(stream);
  //创建缓存，用来缓存声音
  var bufferSize = 2048;

    // 创建声音的缓存节点，createJavaScriptNode方法的
    // 第二个和第三个参数指的是输入和输出都是双声道。
  recorder = audioContext.createScriptProcessor(bufferSize, 1, 1)
  //analyser = audioContext.createAnalyser();
  mic.connect(recorder);
  recorder.connect(audioContext.destination);
  //analyAudio();

  recorder.onaudioprocess = function(audioProcessingEvent) {
    //console.log('getByteFrequencyData analyAudio222');
    var inputBuffer = audioProcessingEvent.inputBuffer;

    // The output buffer contains the samples that will be modified and played
    var outputBuffer = audioProcessingEvent.outputBuffer;

    // Loop through the output channels (in this case there is only one)
    for (var channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
      var inputData  = inputBuffer.getChannelData(channel);
      var outputData = outputBuffer.getChannelData(channel);
      if(audioEngine.processFFmpegBuffer(inputData, inputData, 1000) == -1){
        console.log("array is empty.")
      }
      else{

      }
      // console.log("array is not empty%d，sampleRate is  %d, ths first is2 %f.", inputData.length, audioContext.sampleRate, outputData[0])
      //设置inputData

    }
  }
  stream.oninactive = function() {
    console.log('Stream ended');
  };
  window.stream = stream; // make variable available to browser console
  audio.srcObject = stream;
}

function analyAudio(){
  var array =  new Uint8Array(128);
  analyser.getByteFrequencyData(array);
  console.log('getByteFrequencyData analyAudio');
  for ( var i = 0; i < (array.length); i++ ){

  }
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.getUserMedia(constraints, handleSuccess, handleError);

//navigator.mediaDevices.getUserMedia(constraints).
//    then(handleSuccess).catch(handleError);
