var inherits = require('util').inherits;

var dummy = function() {};

function LiveBaseRenderer(buffer, writer, target, opts) {
	this.constructor.super_.call(this, buffer, opts);

	var self = this;
	this.target = target;
	this.writer = writer;
	this._views = [];
	this._oldViews = [];
	buffer.on('lineremove', function(number) {
		var view = this._views.splice(number, 1)[0];
		self._removeLine(number, view);
		this._oldViews.push(view);
	});
	buffer.on('linechange', function(number, line) {
		var view = self._changeLine(number, this._views[number], line);
		if(view !== undefined)
			this._views[number] = view;
	});
	buffer.on('lineinsert', function(number, line) {
		var view = self._insertLine(number, this._oldViews.shift(), line);
		this._views.splice(number, 0, view);
	});
	buffer.on('ledchange', function() {
		// TODO
		self._changeLed();
	});
	buffer.on('cursormove', function() {
		// TODO
		self._moveCursor();
	});
	buffer.on('resize', function() {
		// TODO
		self._resize();
	});
	writer.on('finished', function() {
		self._commit();
	});
	buffer.on('bell', function() {
		self._bell();
	});
}
module.exports = LiveBaseRenderer;

LiveBaseRenderer.prototype._removeLine =
LiveBaseRenderer.prototype._changeLine =
LiveBaseRenderer.prototype._insertLine =
LiveBaseRenderer.prototype._changeLed =
LiveBaseRenderer.prototype._moveCursor =
LiveBaseRenderer.prototype._commit = dummy;
