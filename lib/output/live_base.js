var inherits = require('util').inherits;

var dummy = function() {};

function LiveBaseOutput(state, writer, target, opts) {
	LiveBaseOutput.super_.apply(this, arguments);

	var i;
	this.target = target;
	this.writer = writer;
	this._views = [];
	this._oldViews = [];
	this._cursorView = null;
	var registerEvents = {
		lineremove: this._removeLine,
		linechange: this._changeLine,
		lineinsert: this._insertLine,
		ledchange: this._changeLed,
		cursormove: this._setCursor,
		resize: this._resize,
		bell: this._bell
	};
	this._cursorDrawnAt = null;

	var self = this;
	var reg = function(i) {
		state.on(i, function() {
			registerEvents[i].apply(self, arguments);
		});
	};
	for(i in registerEvents) {
		reg(i);
	}
	writer.on('ready', function() {
		self._commit();
	});
}
inherits(LiveBaseOutput, require('./base'));
module.exports = LiveBaseOutput;

LiveBaseOutput.prototype._updateCursor = function(action, number) {
	if(!this._opts.adhesiveCursor || this._cursorDrawnAt === null)
		return;
	switch(action) {
	case 'insert':
		if(number <= this._cursorDrawnAt)
			this._cursorDrawnAt = Math.min(this._cursorDrawnAt + 1, this.state.rows - 1);
		break;
	case 'change':
		if(number === this._cursorDrawnAt && number !== this.state.cursor.y)
			this._cursorDrawnAt = null;
		break;
	case 'remove':
		if(number < this._cursorDrawnAt)
			this._cursorDrawnAt--;
		else if(number === this._cursorDrawnAt)
			this._cursorDrawnAt = null;
		break;
	}
};

LiveBaseOutput.prototype._removeLine = function(number) {
	var view = this._views.splice(number, 1)[0];
	this.removeLine(number, view);
	if(view)
		this._oldViews.push(view);

	this._updateCursor('remove', number);
};

LiveBaseOutput.prototype._changeLine = function(number, line, cursor) {
	var view = this.changeLine(number, this._views[number], line, cursor);
	if(view !== undefined)
		this._views[number] = view;
};

LiveBaseOutput.prototype._insertLine = function(number, line, cursor) {
	var view = this.insertLine(
		number,
		this._oldViews.shift() || this.createView(),
	line, cursor);
	this._views.splice(number, 0, view);

	this._updateCursor('insert', number);
};

LiveBaseOutput.prototype._changeLed = function() {
	this.changeLed.apply(this, arguments);
};

LiveBaseOutput.prototype._setCursor = function(x, y) {
	this._cursorView = this.setCursor(x, y);
};

LiveBaseOutput.prototype._resize = function(size) {
	this.resize(size);
};

LiveBaseOutput.prototype._commit = function() {
	var c = this.state.cursor;
	if(c.y !== this._cursorDrawnAt && this._cursorDrawnAt !== null) {
		this._changeLine(this._cursorDrawnAt, this.state.getLine(this._cursorDrawnAt));
	}

	if(c.y < this._views.length) {
		this._changeLine(c.y, this.state.getLine(c.y), c.x);
		this._cursorDrawnAt = c.y;
	}


	this.commit.apply(this, arguments);
};

LiveBaseOutput.prototype._bell = function() {
	this.bell.apply(this, arguments);
};


LiveBaseOutput.prototype.createView =
LiveBaseOutput.prototype.removeLine =
LiveBaseOutput.prototype.changeLine =
LiveBaseOutput.prototype.insertLine =
LiveBaseOutput.prototype.changeLed =
LiveBaseOutput.prototype.setCursor =
LiveBaseOutput.prototype.resize =
LiveBaseOutput.prototype.bell =
LiveBaseOutput.prototype.commit = dummy;
