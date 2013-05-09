var stream = require('stream');
var util = require('util');

var CSI_PATTERN = /^\x1b\[([?!>]?)([0-9;]*)([@A-Za-z`]?)/;

function TermWriter(buffer) {
	TermWriter.super_.call(this, { decodeStrings: false });
	this.buffer = buffer;
	this.oldChunk = null;
};
util.inherits(TermWriter, stream.Writable);
module.exports = TermWriter;
module.exports.TermWriter = TermWriter;

TermWriter.prototype.handlers = {
	chr: require('./handler/chr.js'),
	esc: require('./handler/esc.js'),
	csi: require('./handler/csi.js'),
	sgr: require('./handler/sgr.js'),
	mode: require('./handler/mode.js')
};

TermWriter.prototype._write = function(chunk, encoding, callback) {
	var len = 1;
	if(typeof chunk !== 'string')
		chunk = chunk.toString();

	if(this.oldChunk !== null) {
		chunk = this.oldChunk + chunk;
		this.oldChunk = null;
	}

	while(chunk.length > 0 && len > 0) {
		len = this.callHandler('chr', chunk[0], chunk);
		if(len === null) {
			for(len = 1; len < chunk.length &&
				!(chunk[len] in this.handlers.chr); len++);

			this.buffer.inject(chunk, len);
		}

		if(len > 0)
			chunk = chunk.slice(len);
	}
	if(chunk.length !== 0)
		this.oldChunk = chunk;
	callback();
};

TermWriter.prototype.callHandler = function(type, cmd) {
	if(!(type in this.handlers && cmd in this.handlers[type]))
		return null;
	
	var args = Array.prototype.slice.call(arguments, 1);
	if(typeof this.handlers[type][cmd] === 'string')
		cmd = this.handlers[type][cmd];

	result = this.handlers[type][cmd].apply(this, args);
	return result === undefined ? 1 : result;
};

TermWriter.prototype.parseCsi = function(chunk) {
	var match = CSI_PATTERN.exec(chunk);
	if(match === null)
		return null;
	return {
		args: match[2] === "" ? [] : match[2].split(';'),
		mod: match[1],
		cmd: match[3],
		length: match[0].length
	};
}

TermWriter.prototype.toString = function() {
	return this.buffer.toString.apply(this.buffer, arguments);
}
