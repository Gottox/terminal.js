var myUtil = require('../util');
var inherits = require('util').inherits;
var HtmlRenderer = require('./html.js');

function DomRenderer(buffer, writer, target, opts) {
	this.html = new HtmlRenderer(buffer, opts);
	DomRenderer.super_.call(this, buffer, writer, target, opts);
	this.target.innerHTML = "<div style='line-height:0;visibility:hidden;'></div>";
}
inherits(DomRenderer, require('./live_base.js'));
module.exports = DomRenderer;


DomRenderer.prototype._createView = function() {
	var e = this.target.ownerDocument.createElement("div");
	this.html._mkAttr({$line:true}, e);
	return e;
};
DomRenderer.prototype._removeLine = function(number, view) {
	return this.target.removeChild(view);
};
DomRenderer.prototype._changeLine = function(number, view, line) {
	view.innerHTML = this.html._renderLine();
};
DomRenderer.prototype._insertLine = function(number, view, line) {
	view.innerHTML = this.html._renderLine(number);
	this.target.insertBefore(view, this.target.childNodes[number]);
	return view;
};
DomRenderer.prototype._changeLed = function(l1, l2, l3, l4) {

};
DomRenderer.prototype._setCursor = function(x, y, oldX, oldY) {
	//this.target.childNodes[oldY].innerHTML = this.html._renderLine(oldY);
	//this.target.childNodes[y].innerHTML = this.html._renderLine(y);
};
DomRenderer.prototype._resize = function(x, y) {
	this.target.lastChild.innerHTML = this.html._genWidthString();
};
DomRenderer.prototype._commit = function() {

};

DomRenderer.canHandle = function(target) {
	// Test if target is some kind of DOM-Element
	return typeof target === 'object' && 'ownerDocument' in target;
};
