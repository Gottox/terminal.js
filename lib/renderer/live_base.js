var inherits = require('util').inherits;

var dummy = function() {};

function LiveBaseRenderer(buffer, writer, target, opts) {
	LiveBaseRenderer.super_.call(this, buffer, opts);

	var i = 0;
	var self = this;
	this.target = target;
	this.writer = writer;
	this._views = [];
	this._oldViews = [];
	buffer.on('lineremove', function(number) {
		var view = this._views.splice(number, 1)[0];
		self._removeLine(number, view);
		if(view)
			this._oldViews.push(view);
	});
	buffer.on('linechange', function(number, line) {
		var view = self._changeLine(number, this._views[number], line);
		if(view !== undefined)
			this._views[number] = view;
	});
	buffer.on('lineinsert', function(number, line) {
		var view = self._insertLine(
			number,
			self._oldViews.shift() || self._createView(),
			line);
		self._views.splice(number, 0, view);
	});
	buffer.on('ledchange', function() {
		self._changeLed.apply(self, arguments);
	});
	buffer.on('cursormove', function(x, y, oldX, oldY) {
		// TODO
		self._setCursor(x, y);
	});
	buffer.on('resize', function(w, h) {
		// TODO
		self._resize(w, h);
	});
	writer.on('finished', function() {
		self._commit();
	});
	buffer.on('bell', function() {
		self._bell();
	});

	for(i = 0; i < this.buffer.getBufferHeight(); i++) {
		this._insertLine(i, this._createView() ,this.buffer.getLine(i));
	}
}
module.exports = LiveBaseRenderer;

LiveBaseRenderer.prototype._createView =
LiveBaseRenderer.prototype._removeLine =
LiveBaseRenderer.prototype._changeLine =
LiveBaseRenderer.prototype._insertLine =
LiveBaseRenderer.prototype._changeLed =
LiveBaseRenderer.prototype._setCursor =
LiveBaseRenderer.prototype._commit = dummy;
