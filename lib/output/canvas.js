"use strict";

var myUtil = require("../util");
var inherits = require("util").inherits;

function CanvasOutput(state, writer, target, opts) {
	CanvasOutput.super_.apply(this, arguments);
	this._opts.adhesiveCursor = true;
	this._updateRowCount();
}
inherits(CanvasOutput, require("./live_base.js"));
module.exports = CanvasOutput;

CanvasOutput.prototype._detach = function(view, blk) {
	var parent = view.parentNode;
	var next = view.nextSibling;
	parent.removeChild(view);
	blk.call(this, view);
	if(next)
		parent.insertBefore(view, next);
	else
		parent.appendChild(view);
	return view;
};

CanvasOutput.prototype.createView = function() {
};

CanvasOutput.prototype.removeLine = function(number, view) {
};

CanvasOutput.prototype.changeLine = function(number, view, line, cursor) {
};

CanvasOutput.prototype.insertLine = function(number, view, line, cursor) {
};

CanvasOutput.prototype.changeLed = function(l1, l2, l3, l4) {
};

CanvasOutput.prototype.setCursor = function(x, y) {
};

CanvasOutput.prototype.resize = function(size) {
};

CanvasOutput.prototype.commit = function() {
};

CanvasOutput.canHandle = function(target) {
	// Test if target is some kind of Canvas
};
