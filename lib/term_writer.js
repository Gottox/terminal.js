var stream = require('stream');
var util = require('util');

var CSI_PATTERN = /^\x1b\[([?!>]?)([0-9;]*)([@A-Za-z`]?)/;

function TermWriter(termBuffer) {
	TermWriter.super_.call({ decodeStrings: false });
	this.termBuffer = termBuffer;
	this.oldChunk = null;
};
util.inherits(module.exports, stream.Writable);
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

			this.termBuffer.inject(chunk, len);
		}

		if(len > 0)
			chunk = chunk.slice(len);
	}
	if(chunk.length !== 0)
		this.oldChunk = chunk;
	return true;
};

TermWriter.prototype.callHandler = function(type, id) {
	if(!(type in this.handlers || this.handlers[type] in type))
		return null;
	
	var args = Array.prototype.slice.call(arguments, 2);
	args.unshift(id);
	if(typeof this.handlers[type][id] === 'string')
		id = this.handlers[type][id];

	return this.handlers[type][id].call(this, args) === undefined ? 1 : 0;
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
