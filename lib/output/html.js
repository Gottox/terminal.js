var myUtil = require('../util');
var inherits = require('util').inherits;

function HtmlOutput(state, opts) {
	HtmlOutput.super_.apply(this, arguments);
}
inherits(HtmlOutput, require('./base'));
module.exports = HtmlOutput;

HtmlOutput.prototype._defOpts = {
	cssClass: false,
	cursorBg: '#00ff00',
	cursorFg: '#ffffff',
};

// Taken from https://github.com/dtinth/headles-terminal/blob/master/vendor/term.js#L226
HtmlOutput.prototype.colors = [
	// dark:
	'#2e3436',
	'#cc0000',
	'#4e9a06',
	'#c4a000',
	'#3465a4',
	'#75507b',
	'#06989a',
	'#d3d7cf',
	// bright:
	'#555753',
	'#ef2929',
	'#8ae234',
	'#fce94f',
	'#729fcf',
	'#ad7fa8',
	'#34e2e2',
	'#eeeeec'
];

// Taken from https://github.com/chjj/tty.js/blob/master/static/term.js#L250
// Colors 16-255
// Thanks to TooTallNate for writing this.
HtmlOutput.prototype.colors = (function() {
	function out(r, g, b) {
		colors.push('#' + hex(r) + hex(g) + hex(b));
	}

	function hex(c) {
		c = c.toString(16);
		return c.length < 2 ? '0' + c : c;
	}

	var colors = HtmlOutput.prototype.colors,
		r = [0x00, 0x5f, 0x87, 0xaf, 0xd7, 0xff], i;

	// 16-231
	i = 0;
	for (; i < 216; i++) {
		out(r[(i / 36) % 6 | 0], r[(i / 6) % 6 | 0], r[i % 6]);
	}

	// 232-255 (grey)
	i = 0;
	for (; i < 24; i++) {
		r = 8 + i * 10;
		out(r, r, r);
	}

	return colors;
})();

HtmlOutput.prototype._mkCssProperties = function(attr) {
	if(!attr)
		return;
	var css = {};
	var p, html = '', inverse = !!attr.inverse;

	for(p in attr) {
		if(attr[p] === false || attr[p] === null)
			continue;
		switch(p) {
		case 'fg':
			css[inverse ? 'background' : 'color'] = this.colors[attr[p]];
			break;
		case 'bg':
			css[inverse ? 'color' : 'background'] = this.colors[attr[p]];
			break;
		case 'bold':
			css['font-weight'] = 'bold';
			break;
		case 'italic':
			css['font-style'] = 'italic';
			break;
		case 'underline':
		case 'blink':
			css['text-decoration'] = (css['text-decoration'] || '') + ' ' + p;
			break;
		case 'doublewidth':
			css['-webkit-transform'] = (css['-webkit-transform'] || '') + ' scaleX(2)';
			css['-moz-transform'] = (css['-moz-transform'] || '') + ' scaleX(2)';
			if(!css['-moz-transform-origin'] && !css['-moz-transform-origin'])
				css['-moz-transform-origin'] = css['-webkit-transform-origin'] = 'left';
			break;
		case 'doubleheight':
			css['-webkit-transform'] = (css['-webkit-transform'] || '') + ' scaleY(2)';
			css['-moz-transform'] = (css['-moz-transform'] || '') + ' scaleY(2)';
			css['-moz-transform-origin'] =
			css['-webkit-transform-origin'] = 'left ' + attr[p];
			break;
		case '$cursor':
			css.background = this._opts.cursorBg;
			css.color = this._opts.cursorFg;
			break;
		case '$line':
			css.overflow = 'hidden';
			break;
		}
	}
	for(p in css) {
		html += p + ':' + css[p] + ';';
	}
	return html;
};

var PATTERN_LT = /</g;
var PATTERN_GT = />/g;
var PATTERN_SPACE = / /g;
HtmlOutput.prototype.escapeHtml = function(str) {
	return str.replace(PATTERN_LT, '&lt;').
				replace(PATTERN_GT, '&gt;').
				replace(PATTERN_SPACE, '&nbsp;');
};

HtmlOutput.prototype._mkAttr = function(attr, extra, e) {
	var css = this._mkCssProperties(attr) +
		this._mkCssProperties(extra);
	if(e) {
		e.setAttribute('style', 'white-space: nowrap;'+css);
	}
	return 'style="' + css + '"';
};

HtmlOutput.prototype._renderLine = function(line, cursor) {
	var i, start;
	var html = '', attr;
	var str = line.str;

	if(line.attr[str.length].bg !== null)
		str += myUtil.repeat(' ', this.state.columns - str.length);
	else if(cursor !== undefined)
		str += myUtil.repeat(' ', cursor + 1 - str.length);

	for(i = 0; i < str.length;) {
		start = i++;
		if(start in line.attr)
			attr = line.attr[start];
		if(cursor !== start)
			while(i < str.length && !(i in line.attr) && cursor !== i)
				i++;

		html += '</span><span ' +
			this._mkAttr(attr, { $cursor: this.state.getMode('cursor') && cursor === start}) +
			'>' + this.escapeHtml(str.substring(start, i));
	}
	return '<span>' + html + '</span><br />';
};

HtmlOutput.prototype.toString = function() {
	var i;

	var lines = '';
	for(i = 0; i < this.state.rows; i++) {
		var line = this.state.getLine(i);
		lines += '<div '+ this._mkAttr(line.attr, {$line:true}) + '>' +
			this._renderLine(line) + '</div>';
	}
	return lines + '<div style="line-height:0;visibility:hidden;">' +
		this._genColumnsString() + '</div>';
};

HtmlOutput.prototype._genColumnsString = function() {
	return myUtil.repeat('&nbsp;',this.state.columns);
};

HtmlOutput.canHandle = function(target) {
	return target === 'html';
};
