var myUtil = require('../util');
var inherits = require('util').inherits;

function TtyInput(target, source, buffer, opts) {
	DomInput.super_.apply(this, arguments);
	var self = this;
	target.on('readable', function() {
		self.doread();
	});
}
inherits(TtyInput, require('./base'));
module.exports = TtyInput;

APP_KEYPAD_PATTERN = /\x1b\[([0-9;]*[ABCD])/g;
TtyInput.prototype.doread = function() {
	var data = this.target.read().toString();
	if(this.appKeypad)
		data = data.replace(APP_KEYPAD_PATTERN, '\x1bO$1');

	this.source.write(data);
};

TtyInput.canHandle = function(target) {
	return typeof target === 'object' && 'read' in target && 'on' in target;
};
