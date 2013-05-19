var myUtil = require('../util');
var inherits = require('util').inherits;
function genCall(name) {
	return function() {
		if(typeof this.pty[name] === 'function')
			return this.pty[name].apply(this.pty, arguments);
		else {
			Array.prototype.unshift.call(arguments, name);
			return this.pty.emit.apply(this.pty, arguments);
		}
	};
}

function EmitterPty(writer, pty, opts) {
	this._defOpts = {
	};
	EmitterPty.super_.call(this, writer, pty, opts);

	this._register();
}
inherits(EmitterPty, require('./base'));
module.exports = EmitterPty;

EmitterPty.prototype._register = function() {
	var self = this;
	var writer = this.writer;

	this.pty
		.on('data', function(data) {
			writer.write(data);
		})
		.on('exit', function() {
			writer.end();
		});
};


EmitterPty.prototype.write = genCall('write');
EmitterPty.prototype.end = genCall('end');
EmitterPty.prototype._resize = genCall('resize');
EmitterPty.prototype.kill = genCall('kill');
EmitterPty.prototype.resize = function(h, w) {
	return this._resize(w, h);
};

EmitterPty.canHandle = function(pty) {
	return pty && typeof pty.addListener === 'function' &&
		typeof pty.on === 'function';
};
