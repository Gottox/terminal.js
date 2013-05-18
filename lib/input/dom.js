var myUtil = require('../util');
var inherits = require('util').inherits;

function DomInput(target, pty, opts) {
	this._defOpts = {
	};
	DomInput.super_.call(this, target, pty, opts);
}
inherits(DomInput, require('./base'));
module.exports = DomInput;

HtmlRenderer.canHandle = require('../renderer/dom.js').canHandle;
