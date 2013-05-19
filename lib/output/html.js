var myUtil = require('../util');
var inherits = require('util').inherits;

function HtmlOutput(buffer, opts) {
	this._defOpts = {
		cssClass: false,
		cursorBg: '#00ff00',
		cursorFg: '#ffffff',
	};
	this._colors = {
		0: '#000000',
		1: '#ff0000',
		2: '#ffff00',
		3: '#00ff00',
		4: '#0000ff',
		5: '#ff00ff',
		6: '#00ffff',
		7: '#ffffff'
	};
	HtmlOutput.super_.call(this, buffer, opts);
}
inherits(HtmlOutput, require('./base'));
module.exports = HtmlOutput;

HtmlOutput.prototype._mkCssProperties = function(attr, element) {
	if(!attr)
		return;
	var css = element && element.style ? element.style : {};
	var p, html = "", inverse = !!attr.inverse;
	 

	for(p in attr) {
		if(attr[p] === false || attr[p] === null)
			continue;
		switch(p) {
		case 'fg':
			css[inverse ? "background" : "color"] = this._colors[attr[p]];
			break;
		case 'bg':
			css[inverse ? "color" : "background"] = this._colors[attr[p]];
			break;
		case 'bold':
			css["font-weight"] = "bold";
			break;
		case 'underline':
		case 'blink':
			css["text-decoration"] = (css["text-decoration"] || "") + " " + p;
			break;
		case '$cursor':
			css.background = this._opts.cursorBg;
			css.color = this._opts.cursorFg;
			break;
		case '$line':
			css['line-height'] = '20px';
			css['font-size'] = '20px';
			css.overflow = 'hidden';

			break;
		}
	}
	for(p in css) {
		html += p + ":" + css[p] + ";";
	}
	return html;
};

HtmlOutput.prototype.escapeHtml = function(str) {
	return str.replace(/</g, "&lt;").
				replace(/>/g, "&gt;").
				replace(/ /g, "&nbsp;");
};

HtmlOutput.prototype._mkAttr = function(attr, extra, e) {
	return 'style="' + this._mkCssProperties(attr, e) +
		this._mkCssProperties(extra, e) + '"';
};

HtmlOutput.prototype._renderLine = function(line, cursor) {
	var i, start;
	var html = "", attr;
	var str = line.str;

	if(line.attr[str.length].bg !== null)
		str += myUtil.repeat(' ', this.buffer.width - str.length);
	else if(cursor !== undefined)
		str += myUtil.repeat(' ', cursor + 1 - str.length);

	for(i = 0; i < str.length;) {
		start = i++;
		if(start in line.attr)
			attr = line.attr[start];
		if(cursor !== start)
			while(i < str.length && !(i in line.attr) && cursor != i)
				i++;

		html += "</span><span " +
			this._mkAttr(attr, { $cursor: cursor === start}) +
			">" + this.escapeHtml(str.substring(start, i));
	}
	return "<span>" + html + "</span><br />";
};

HtmlOutput.prototype.toString = function() {
	var i;

	var lines = "";
	for(i = 0; i < this.buffer.height; i++) {
		lines += "<div "+ this._mkAttr({$line:true}) + ">" +
			this._renderLine(this.buffer.getLine(i)) + "</div>";
	}
	return lines + "<div style='line-height:0;visibility:hidden;'>" + 
		this._genWidthString() + "</div>";
};

HtmlOutput.prototype._genWidthString = function() {
	return myUtil.repeat('&nbsp;',this.buffer.width);
};

HtmlOutput.canHandle = function(target) {
	return target === 'html';
};
