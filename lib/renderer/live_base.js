var inherits = require('util').inherits;

var dummy = function() {};

function LiveBaseRenderer(buffer, writer, target, opts) {
	LiveBaseRenderer.super_.apply(this, arguments);

	var i = 0;
	var self = this;
	this.target = target;
	this.writer = writer;
	this._views = [];
	this._oldViews = [];
	buffer.on('lineremove', function(number) {
		var view = self._views.splice(number, 1)[0];
		self._removeLine(number, view);
		if(view)
			self._oldViews.push(view);
	});
	buffer.on('linechange', function(number, line) {
		var view = self._changeLine(number, self._views[number], line);
		if(view !== undefined)
			self._views[number] = view;
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
		self._setCursor(x, y, oldX, oldY);
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

	for(i = 0; i < this.buffer.height; i++) {
		this._insertLine(i, this._createView() ,this.buffer.getLine(i));
	}

	this._resize(this.buffer.width, this.buffer.height);
}
inherits(LiveBaseRenderer, require('./base'));
module.exports = LiveBaseRenderer;

LiveBaseRenderer.prototype._createView =
LiveBaseRenderer.prototype._removeLine =
LiveBaseRenderer.prototype._changeLine =
LiveBaseRenderer.prototype._insertLine =
LiveBaseRenderer.prototype._changeLed =
LiveBaseRenderer.prototype._setCursor =
LiveBaseRenderer.prototype._resize =
LiveBaseRenderer.prototype._commit = dummy;
