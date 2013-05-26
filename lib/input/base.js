var myUtil = require('../util.js');

function BaseInput(target, source, buffer) {
	var opts = arguments[Math.max(1, arguments.length - 1)];
	this.target = target;
	this.source = source;
	this.buffer = buffer;
	this._appKeypad = false;
	var self = this;
	buffer.on('modechange', function(name, value) {
		if(name === 'appKeypad')
			self._appKeypad = value;
	});
	this._opts = myUtil.extend({}, this._defOpts, opts);
}

BaseInput.prototype.getKey = function(key) {
	switch(key) {
	case 'up':
		key = this._appKeypad ? '\x1bOA' : '\x1b[A';
		break;
	case 'down':
		key = this._appKeypad ? '\x1bOB' : '\x1b[B';
		break;
	case 'right':
		key = this._appKeypad ? '\x1bOC' : '\x1b[C';
		break;
	case 'left':
		key = this._appKeypad ? '\x1bOD' : '\x1b[D';
		break;
	}
	return key;
};
module.exports = BaseInput;
