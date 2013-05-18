var myUtil = require('../util');
var inherits = require('util').inherits;

function HtmlRenderer(buffer, opts) {
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
	HtmlRenderer.super_.call(this, buffer, opts);
}
inherits(HtmlRenderer, require('./base'));
module.exports = HtmlRenderer;

HtmlRenderer.prototype._mkCssProperties = function(attr, element) {
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
			css['font-family'] = "monospace";
			break;
		}
	}
	for(p in css) {
		html += p + ":" + css[p] + ";";
	}
	return html;
};

HtmlRenderer.prototype.escapeHtml = function(str) {
	return str.replace(/</g, "&lt;").
				replace(/>/g, "&gt;").
				replace(/ /g, "&nbsp;");
};

HtmlRenderer.prototype._mkAttr = function(attr, extra, e) {
	return 'style="' + this._mkCssProperties(attr, e) +
		this._mkCssProperties(extra, e) + '"';
};

HtmlRenderer.prototype._renderLine = function(nbr, cursor) {
	var i, start;
	var line = this.buffer.getLine(nbr);
	var html = "", attr;

	for(i = 0; i < line.str.length;) {
		start = i++;
		if(start in line.attr)
			attr = line.attr[start];
		if(cursor !== i)
			while(i < line.str.length && !(i in line.attr) && cursor != i)
				i++;

		html += "</span><span " +
			this._mkAttr(attr, { cursor: cursor === start}) +
			">" + this.escapeHtml(line.str.substring(start, i));
	}

	if(line.str.length <= cursor) {
		html += myUtil.repeat('&nbsp', cursor - line.str.length) +
			"<span " + this._mkAttr({$cursor:true}) + ">&nbsp;</span>";
	}
	return "<span>" + html + "</span><br />";
};

HtmlRenderer.prototype.toString = function() {
	var i;

	var lines = "";
	for(i = 0; i < this.buffer.height; i++) {
		lines += "<div "+ this._mkAttr({$line:true}) + ">" + this._renderLine(i) + "</div>";
	}
	return lines + "<div style='line-height:0;visibility:hidden;'>" + 
		this._genWidthString() + "</div>";
};

HtmlRenderer.prototype._genWidthString = function() {
	return myUtil.repeat('&nbsp;',this.buffer.width);
};

HtmlRenderer.canHandle = function(target) {
	return target === 'html';
};
