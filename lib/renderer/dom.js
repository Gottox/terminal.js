var myUtil = require('../util');
var inherits = require('util').inherits;
var HtmlRenderer = require('./html.js');

function DomRenderer(buffer, writer, target, opts) {
	this.html = new HtmlRenderer(buffer, opts);
	DomRenderer.super_.call(this, buffer, writer, target, opts);
}
inherits(DomRenderer, require('./live.js'));
module.exports = DomRenderer;


LiveBaseRenderer.prototype._createView = function() {
	var d = this.target.ownerDocument;
	return d.createElement("div");
};
LiveBaseRenderer.prototype._removeLine = function(number, view) {
	return this.target.removeChild(view);
};
LiveBaseRenderer.prototype._changeLine = function(number, view, line) {
	view.innerHTML = this.html._renderLine();
};
LiveBaseRenderer.prototype._insertLine = function(number, view, line) {
	view.innerHTML = this.html._renderLine(number);
	this.target.insertBefore(view, this.target.childNodes[number]);
	return view;
};
LiveBaseRenderer.prototype._changeLed = function(l1, l2, l3, l4) {

};
LiveBaseRenderer.prototype._setCursor = function(x, y, oldX, oldY) {
	this.target.childNodes[oldY].innerHTML = this.html._renderLine(oldY);
	this.target.childNodes[y].innerHTML = this.html._renderLine(y);
};
LiveBaseRenderer.prototype._commit = function() {

};
