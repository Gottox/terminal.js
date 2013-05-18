var inherits = require('util').inherits;

function PlainRenderer(buffer, opts) {
	PlainRenderer.super_.call(this, buffer, opts);
}
inherits(PlainRenderer, require('./base.js'));
module.exports = PlainRenderer;

PlainRenderer.prototype.toString = function() {
	var lines = "";
	var locateCursor = this._opts.locateCursor;

	if(locateCursor)
		lines += repeat(' ', this.buffer.cursor.x+1) + 'v\n';

	for(var i = 0; i < this.buffer.height; i++) {
		var line = this.buffer.getLine(i);
		if(locateCursor) {
			lines += i == this.buffer.cursor.y ? ">" : " ";
		}
		lines += line.str + "\n";
	}
	if(locateCursor)
		lines += repeat(' ', this.buffer.cursor.x+1) + '^\n';

	return lines;
};

PlainRenderer.canHandle = function(target) {
	return target == 'plain';
};
