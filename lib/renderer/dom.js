var myUtil = require('../util');
var inherits = require('util').inherits;
var HtmlRenderer = require('./html.js');

function DomRenderer(buffer, writer, target, opts) {
	this.html = new HtmlRenderer(buffer, opts);
	target.innerHTML = "<div style='line-height:0;visibility:hidden;font-family:monospace'></div>";
	this.cursorView = null;
	DomRenderer.super_.call(this, buffer, writer, target, opts);
	this._opts.adhesiveCursor = true;
}
inherits(DomRenderer, require('./live_base.js'));
module.exports = DomRenderer;


DomRenderer.prototype.createView = function() {
	var e = this.target.ownerDocument.createElement("div");
	this.html._mkAttr({}, {$line:true}, e);
	return e;
};
DomRenderer.prototype.removeLine = function(number, view) {
	return this.target.removeChild(view);
};
DomRenderer.prototype.changeLine = function(number, view, line, cursor) {
	view.innerHTML = this.html._renderLine(number, cursor);
};
DomRenderer.prototype.insertLine = function(number, view, line, cursor) {
	view.innerHTML = this.html._renderLine(number, cursor);
	this.target.insertBefore(view, this.target.childNodes[number]);
	return view;
};
DomRenderer.prototype.changeLed = function(l1, l2, l3, l4) {

};
DomRenderer.prototype.setCursor = function(x, y) {
};
DomRenderer.prototype.resize = function(x, y) {
	this.target.lastChild.innerHTML = this.html._genWidthString();
};
DomRenderer.prototype.commit = function() {

};

DomRenderer.canHandle = function(target) {
	// Test if target is some kind of DOM-Element
	return typeof target === 'object' && 'ownerDocument' in target;
};
