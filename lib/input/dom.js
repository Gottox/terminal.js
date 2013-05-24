var myUtil = require('../util');
var inherits = require('util').inherits;

var isMac = typeof window !== 'undefined' && ~window.navigator.userAgent.indexOf('Mac');

function DomInput(target, source, buffer, opts) {
	DomInput.super_.apply(this, arguments);

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
	catcher.addEventListener('keydown', function(e) {
		return self._keydown(e);
	});
};

DomInput.prototype._focus = function(ev) {
	this._inputCatcher.focus();
	this.target.className += ' focus';
};

DomInput.prototype._blur = function(ev) {
	this.target.className = this.target.className.replace(' focus', '');
};

// Taken from tty.js: https://github.com/chjj/tty.js
DomInput.prototype._keypress = function(ev) {
	var key;

	if (ev.charCode)
		key = ev.charCode;
	else if (ev.which === null)
		key = ev.keyCode;
	else if (ev.which !== 0 && ev.charCode !== 0)
		key = ev.which;
	else
		return;
	if (!key || ev.ctrlKey || ev.altKey || ev.metaKey) return;

	ev.stopPropagation();
	ev.preventDefault();
	this.source.write(String.fromCharCode(key));
};

// Taken from tty.js: https://github.com/chjj/tty.js
DomInput.prototype._keydown = function(ev) {
	var key;

	switch (ev.keyCode) {
		//backspace
	case 8:
		if (ev.shiftKey) {
			key = '\x08'; //^H
			break;
		}
		key = '\x7f'; //^?
		break;
	//tab
	case 9:
		if (ev.shiftKey) {
			key = '\x1b[Z';
			break;
		}
		key = '\t';
		break;
	//return /enter
	case 13:
		key = '\r';
		break;
	//escape
	case 27:
		key = '\x1b';
		break;
	//left - arrow
	case 37:
		key = this.getKey('left');
		break;
	//right - arrow
	case 39:
		key = this.getKey('right');
		break;
	//up - arrow
	case 38:
		key = this.getKey('up');
		break;
	//down - arrow
	case 40:
		key = this.getKey('down');
		break;
	//delete
	case 46:
		key = '\x1b[3~';
		break;
	//insert
	case 45:
		key = '\x1b[2~';
		break;
	//home
	case 36:
		key = '\x1bOH';
		break;
	//end
	case 35:
		key = '\x1bOF';
		break;
	//page up
	case 33:
		key = '\x1b[5~';
		break;
	//page down
	case 34:
		key = '\x1b[6~';
		break;
	//F1
	case 112:
		key = '\x1bOP';
		break;
	//F2
	case 113:
		key = '\x1bOQ';
		break;
	//F3
	case 114:
		key = '\x1bOR';
		break;
	//F4
	case 115:
		key = '\x1bOS';
		break;
	//F5
	case 116:
		key = '\x1b[15~';
		break;
	//F6
	case 117:
		key = '\x1b[17~';
		break;
	//F7
	case 118:
		key = '\x1b[18~';
		break;
	//F8
	case 119:
		key = '\x1b[19~';
		break;
	//F9
	case 120:
		key = '\x1b[20~';
		break;
	//F10
	case 121:
		key = '\x1b[21~';
		break;
	//F11
	case 122:
		key = '\x1b[23~';
		break;
	//F12
	case 123:
		key = '\x1b[24~';
		break;
	default:
		//a - z and space
		if (ev.ctrlKey) {
			if (ev.keyCode >= 65 && ev.keyCode <= 90)
				key = String.fromCharCode(ev.keyCode - 64);
			else if (ev.keyCode === 32)
				//NUL
				key = String.fromCharCode(0);
			else if (ev.keyCode >= 51 && ev.keyCode <= 55)
				//escape, file sep, group sep, record sep, unit sep
				key = String.fromCharCode(ev.keyCode - 51 + 27);
			else if (ev.keyCode === 56)
				//delete
				key = String.fromCharCode(127);
			else if (ev.keyCode === 219)
				//^[-escape
					key = String.fromCharCode(27);
			else if (ev.keyCode === 221)
				//^] - group sep
				key = String.fromCharCode(29);
		} else if ((!isMac && ev.altKey) || (isMac && ev.metaKey)) {
			if (ev.keyCode >= 65 && ev.keyCode <= 90)
				key = '\x1b' + String.fromCharCode(ev.keyCode + 32);
			else if (ev.keyCode === 192)
				key = '\x1b`';
			else if (ev.keyCode >= 48 && ev.keyCode <= 57)
				key = '\x1b' + (ev.keyCode - 48);
		}
		break;
	}
	if(key !== undefined) {
		ev.stopPropagation();
		ev.preventDefault();
		this.source.write(key);
	}
};

DomInput.canHandle = require('../output/dom.js').canHandle;
