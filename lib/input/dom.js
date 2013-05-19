var myUtil = require('../util');
var inherits = require('util').inherits;

function DomInput(target, pty, opts) {
	this._defOpts = {
	};
	DomInput.super_.call(this, target, pty, opts);

	this._createCatcher();
	this._registerEvents();
}
inherits(DomInput, require('./base'));
module.exports = DomInput;

DomInput.prototype._createCatcher = function() {
	var target = this.target;
	var catcher = target.ownerDocument.createElement('input');
	catcher.style.position = 'fixed';
	catcher.style.right =
	catcher.style.bottom = '1000%';
	catcher.border = '0px';
	target.parentNode.insertBefore(catcher, target);
	this._inputCatcher = catcher;
};

DomInput.prototype._registerEvents = function() {
	var catcher = this._inputCatcher;
	var target = this.target;
	var self = this;

	target.addEventListener('click', function(e) {
		return self._focus(e);
	});
	catcher.addEventListener('focus', function(e) {
		return self._focus(e);
	});
	catcher.addEventListener('blur', function(e) {
		return self._blur(e);
	});
	catcher.addEventListener('keypress', function(e) {
		return self._keypress(e);
	});
};

DomInput.prototype._focus = function(event) {
	this._inputCatcher.focus();
	this.target.className += ' focus';
};

DomInput.prototype._blur = function(event) {
	this.target.className = this.target.className.replace(' focus', '');
};

DomInput.prototype._keypress = function(event) {
	event.stopPropagation();
	event.preventDefault();
	var key;
	switch(event.which) {
	case 38: // up
		key = "\x1b[A";
		break;
	case 40: // down
		key = "\x1b[B";
		break;
	case 39: // right
		key = "\x1b[C";
		break;
	case 37: // left
		key = "\x1b[D";
		break;
	default:
		key = String.fromCharCode(event.which);
	}
	this.pty.write(key);
};

DomInput.canHandle = require('../renderer/dom.js').canHandle;
