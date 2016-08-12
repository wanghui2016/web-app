/* eslint-disable */
//Main javascript API
var globalNamespace = {};
(function (exports) {
	exports.createNewFFmpegEngine = function( options ) {
		newEngine = new FFmpegEngine( options );
		return newEngine;
	};
}(typeof exports === 'object' && exports || globalNamespace));

function FFmpegEngine( options ) {
	var ffmpegImpl = require( __dirname + "/build/Release/FFmpegLibNode");
	var defaultOptions = {
		inputChannels: 1,
		framesPerBuffer: 1024
	};
	this.options = options || defaultOptions;
	this.ffmpegEngine = ffmpegImpl.createFFmpegEngine(this.options);
	// this.options = this.ffmpegEngine.getOptions();
	this.ffmpegImpl = ffmpegImpl;

	var _this = this;

	this.processAudio = this.processFFmpegBuffer();
}

FFmpegEngine.prototype.processFFmpegBuffer = function( bufferleft, bufferright, samples) {
	var _this = this;
    var defautBuffer = new Float32Array(bufferleft);
    //console.log("ffmpeg, processFFmpegBuffer the first is %f", bufferleft[0])
	//设置当前buffer
	return this.ffmpegImpl.pushAudioBuffer(defautBuffer);

}

FFmpegEngine.prototype.startRecord = function(url) {

	//var len = url.Length();
	this.ffmpegImpl.startRecord(url);
}
/* eslint-disable */