"use strict";

var myUtil = require("../util");
var inherits = require("util").inherits;

function HtmlOutput(state, opts) {
	HtmlOutput.super_.apply(this, arguments);
}
inherits(HtmlOutput, require("./base"));
module.exports = HtmlOutput;

HtmlOutput.prototype._defOpts = {
	cssClass: false,
	cursorBg: "#00ff00",
	cursorFg: "#ffffff",
};

// Taken from https://github.com/dtinth/headles-terminal/blob/master/vendor/term.js#L226
HtmlOutput.prototype.colors = [
	// dark:
	"#2e3436",
	"#cc0000",
	"#4e9a06",
	"#c4a000",
	"#3465a4",
	"#75507b",
	"#06989a",
	"#d3d7cf",
	// bright:
	"#555753",
	"#ef2929",
	"#8ae234",
	"#fce94f",
	"#729fcf",
	"#ad7fa8",
	"#34e2e2",
	"#eeeeec"
];

// Taken from https://github.com/chjj/tty.js/blob/master/static/term.js#L250
// Colors 16-255
// Thanks to TooTallNate for writing this.
HtmlOutput.prototype.colors = (function() {
	function out(r, g, b) {
		colors.push("#" + hex(r) + hex(g) + hex(b));
	}

	function hex(c) {
		c = c.toString(16);
		return c.length < 2 ? "0" + c : c;
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
	var tmp, css = "";

	if(!attr)
		return "";

	if(attr.fg)
		css += (attr.inverse ? "background" : "color") + ":" + this.colors[attr.fg] + ";";
	if(attr.bg)
		css += (attr.inverse ? "color" : "background") + ":" + this.colors[attr.bg] + ";";
	if(attr.bold)
		css += "font-weight:bold;";
	if(attr.italic)
		css += "font-style:italic;";
	if(attr.underline || attr.blink)
		css += "text-decoration:" + (attr.underline ? "underline " : "") + (attr.blink ? "blink;" : ";");
	if(attr.doublewidth || attr.doubleheight) {
		tmp = (attr.doublewidth ? "scaleX(2) " : "") + (attr.doubleheight ? "scaleY(2);" : ";");
		css += "-webkit-transform:" + tmp + "-webkit-transform:" + tmp;
		tmp = "left " + (attr.doubleheight || "") + ";";
		css += "-moz-transform-origin: " + tmp + "-webkit-transform-origin:" + tmp;
	}
	return css;
};

var PATTERN_LT = /</g;
var PATTERN_GT = />/g;
var PATTERN_SPACE = / /g;
HtmlOutput.prototype.escapeHtml = function(str) {
	return str.replace(PATTERN_LT, "&lt;").
			replace(PATTERN_GT, "&gt;").
			replace(PATTERN_SPACE, "&nbsp;");
};

HtmlOutput.prototype._mkAttr = function(attr, css, e) {
	css = this._mkCssProperties(attr) + css;
	if(css === "")
		return "";

	if(e)
		e.setAttribute("style", "white-space: nowrap;" + css);
	return "style='" + css + "'";
};

HtmlOutput.prototype._renderLine = function(line, cursor) {
	var i, start;
	var html = "", attr, css = "", htmlAttr, content;
	var str = line.str;

	if(line.attr[str.length].bg !== null)
		str += myUtil.repeat(" ", this.state.columns - str.length);
	else if(cursor !== undefined && cursor < this.state.columns)
		str += myUtil.repeat(" ", cursor + 1 - str.length);

	for(i = 0; i < str.length;) {
		css = "";
		start = i++;
		if(start in line.attr)
			attr = line.attr[start];
		if(cursor !== start)
			while(i < str.length && !(i in line.attr) && cursor !== i)
				i++;

		if(this.state.getMode("cursor") && cursor === start)
			css = "background: " + this._opts.cursorBg + "; color: " +
				this._opts.cursorFg + ";";
		htmlAttr = this._mkAttr(attr, css);
		content = this.escapeHtml(str.substring(start, i));
		if(htmlAttr !== "")
			html += "<span " + htmlAttr + ">" + content + "</span>";
		else
			html += content;
	}
	return html + "<br />";
};

HtmlOutput.prototype.toString = function() {
	var i;

	var lines = "";
	for(i = 0; i < this.state.rows; i++) {
		var line = this.state.getLine(i);
		lines += "<div "+ this._mkAttr(line, "overflow: hidden") + ">" +
			this._renderLine(line) + "</div>";
	}
	return lines + "<div style='line-height:0;visibility:hidden;'>" +
		this._genColumnsString() + "</div>";
};

HtmlOutput.prototype._genColumnsString = function() {
	return myUtil.repeat("&nbsp;",this.state.columns);
};

HtmlOutput.canHandle = function(target) {
	return target === "html";
};
