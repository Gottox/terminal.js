var inherits = require('util').inherits;

function PlainRenderer(buffer, opts) {
	this.constructor.super_.call(this, buffer, opts);
}
inherits(PlainRenderer, require('./base.js'));
module.exports = PlainRenderer;

PlainRenderer.prototype.toString = function() {
	var ret = [];
	var locateCursor = this.opts.locateCursor;
	if(locateCursor) {
		ret.push(Array(this.buffer.cursor.x+3).join(' ') + 'v');
	}
	for(var i = 0; i < this.buffer.buffer.length; i++) {
		var line = [];
		if(locateCursor) {
			line.push(
				(this.buffer.buffer[i] && this.buffer.buffer[i].changed) ? "*" : " ",
				i == this.buffer.cursor.y ? ">" : " "
			);
		}
		if(this.buffer.buffer[i])
			for(var j = 0; j < this.buffer.buffer[i].line.length; j++) {
				line.push(this.buffer.buffer[i].line[j] ? (this.buffer.buffer[i].line[j].chr || ' ') : ' ');
			}
			while(line[line.length-1] === ' ') line.pop();
			ret.push(line.join(''));
	}
	if(locateCursor)
		ret.push(Array(this.buffer.cursor.x+3).join(' ') + '^');
	return ret.join('\n');
};
