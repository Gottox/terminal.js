var myUtil = require('../util');
var inherits = require('util').inherits;
var HtmlOutput = require('./html.js');

function DomOutput(buffer, writer, target, opts) {
	this.html = new HtmlOutput(buffer, opts);
	target.innerHTML = "<div style='line-height:0;visibility:hidden;'></div>";
	this.cursorView = null;
	DomOutput.super_.call(this, buffer, writer, target, opts);
	this._opts.adhesiveCursor = true;
}
inherits(DomOutput, require('./live_base.js'));
module.exports = DomOutput;


DomOutput.prototype.createView = function() {
	var e = this.target.ownerDocument.createElement("div");
	this.html._mkAttr({}, {$line:true}, e);
	return e;
};
DomOutput.prototype.removeLine = function(number, view) {
	return this.target.removeChild(view);
};
DomOutput.prototype.changeLine = function(number, view, line, cursor) {
	view.innerHTML = this.html._renderLine(line, cursor);
};
DomOutput.prototype.insertLine = function(number, view, line, cursor) {
	view.innerHTML = this.html._renderLine(line, cursor);
	this.target.insertBefore(view, this.target.childNodes[number]);
	return view;
};
DomOutput.prototype.changeLed = function(l1, l2, l3, l4) {

};
DomOutput.prototype.setCursor = function(x, y) {
};
DomOutput.prototype.resize = function(x, y) {
	this.target.lastChild.innerHTML = this.html._genWidthString();
};
DomOutput.prototype.commit = function() {

};

DomOutput.canHandle = function(target) {
	// Test if target is some kind of DOM-Element
	return target !== null && typeof target === 'object' && 'ownerDocument' in target;
};
