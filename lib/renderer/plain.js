var inherits = require('util').inherits;

function PlainRenderer(buffer, opts) {
	PlainRenderer.super_.call(this, buffer, opts);
}
inherits(PlainRenderer, require('./base.js'));
module.exports = PlainRenderer;

PlainRenderer.prototype.toString = function() {
	var lines = [];
	var locateCursor = this._opts.locateCursor;
	if(locateCursor) {
		ret.push(repeat(' ', this.buffer.cursor.x+2) + 'v');
	}

	for(var i = 0; i < this.buffer.getBufferHeight(); i++) {
		var current_line = this.buffer.getLine(i);
		var line = [];
		if(locateCursor) {
			line.push(
				(current_line && current_line.changed) ? "*" : " ",
				i == this.buffer.cursor.y ? ">" : " "
			);
		}

		if(current_line) {
			for(var j = 0; j < current_line.str.length; j++) {
				var current_char = current_line.str[j];
				line.push(current_char);
			}
		}
		lines.push(line.join(''));
	}
	if(locateCursor) {
		ret.push(repeat(' ', this.buffer.cursor.x+2) + '^');
	}

	return lines.join('\n');
};
