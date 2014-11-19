var inherits = require('util').inherits;

function PlainOutput(buffer, opts) {
	PlainOutput.super_.apply(this, arguments);
}
inherits(PlainOutput, require('./base.js'));
module.exports = PlainOutput;

PlainOutput.prototype.toString = function() {
	var lines = '';
	var locateCursor = this._opts.locateCursor;

	if(locateCursor)
		lines += repeat(' ', this.buffer.cursor.x+1) + 'v\n';

	for(var i = 0; i < this.buffer.rows; i++) {
		var line = this.buffer.getLine(i);
		if(locateCursor) {
			lines += i === this.buffer.cursor.y ? '>' : ' ';
		}
		lines += line.str + '\n';
	}
	if(locateCursor)
		lines += repeat(' ', this.buffer.cursor.x+1) + '^\n';

	return lines;
};

PlainOutput.canHandle = function(target) {
	return target === 'plain';
};
