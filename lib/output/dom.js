"use strict";

var myUtil = require("../util");
var inherits = require("util").inherits;
var HtmlOutput = require("./html.js");

function DomOutput(state, writer, target, opts) {
	this.html = new HtmlOutput(state, opts);
	target.innerHTML = "<div style='visibility:hidden;'></div>";
	this.spacer = target.firstChild;
	this.cursorView = null;
	this.updateQueue = [];
	DomOutput.super_.apply(this, arguments);
	this._opts.adhesiveCursor = true;
	this._updateRowCount();
}
inherits(DomOutput, require("./live_base.js"));
module.exports = DomOutput;

DomOutput.prototype.schedule = function(view, cb) {
	var i;
	for(i = 0; i < this.updateQueue.length; i++) {
		if(this.updateQueue[i].view !== view)
			continue;
		this.updateQueue[i].cb = cb;
		return;
	}
	this.updateQueue.push({ view: view, cb: cb });
};

DomOutput.prototype.createView = function() {
	var e = this.target.ownerDocument.createElement("div");
	return e;
};

DomOutput.prototype.removeLine = function(number, view) {
	this._updateRowCount();
	return this.target.removeChild(view);
};

DomOutput.prototype.changeLine = function(number, view, line, cursor) {
	this.schedule(view, function() {
		view.innerHTML = this.html._renderLine(line, cursor);
	});
};

DomOutput.prototype.insertLine = function(number, view, line, cursor) {
	view.innerHTML = this.html._renderLine(line, cursor);
	this.html._mkAttr(line.attr, {$line:true}, view);
	this.target.insertBefore(view, this.target.childNodes[number]);
	this._updateRowCount();
	return view;
};

DomOutput.prototype.changeLed = function(l1, l2, l3, l4) {

};

DomOutput.prototype.setCursor = function(x, y) {
};

DomOutput.prototype.resize = function(size) {
	this.target.lastChild.innerHTML = this.html._genColumnsString();
};

DomOutput.prototype.commit = function() {
	var i;

	for(i = 0; i < this.updateQueue.length; i++) {
		this.updateQueue[i].cb.call(this);
	}
	this.updateQueue = [];
};
DomOutput.prototype._updateRowCount = function() {
	var diff = this.state.rows - this.state.getBufferRowCount();

	var html = myUtil.repeat("<div>&nbsp;</div>", diff) +
		"<div style='line-height:0'>" + myUtil.repeat("&nbsp;", this.state.columns) + "</div>";

	this.schedule(this.spacer, function() {
		this.spacer.innerHTML = html;
		this.spacer.lineHeight = diff === 0 ? "0" : "inherit";
	});
};

DomOutput.canHandle = function(target) {
	// Test if target is some kind of DOM-Element
	return target !== null && typeof target === "object" && "ownerDocument" in target;
};
