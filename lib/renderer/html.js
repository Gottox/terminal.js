var myUtil = require('../util');
var inherits = require('util').inherits;

function HtmlRenderer(buffer, opts) {
	this._defOpts = {
		cssClass: false
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

HtmlRenderer.prototype._mkCssProperties = function(attr) {
	var css = {}, p, html = "", inverse = !!attr.inverse;

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
				css.background = 'green';
				css.color = 'black';
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

HtmlRenderer.prototype._mkAttr = function(attr, extra) {
	return 'style="' + this._mkCssProperties(attr) + (extra || "")+ '"';
};

HtmlRenderer.prototype._renderLine = function(nbr) {
	var i, start, c = this.buffer.cursor;
	var line = this.buffer.getLine(nbr);
	var html = "";

	for(i = 0; i < line.str.length;) {
		for(start = i++; i < line.str.length && !(i in line.attr); i++);
		// TODO: make cursor optional / listen to termmodes
		html += "</span><span " + this._mkAttr(line.attr[start]) + ">";
		if(c.y == nbr && c.x >= start && c.x < i) {
			html += this.escapeHtml(line.str.substring(start, c.x)) +
				"<span " + this._mkAttr({$cursor:true}) + ">" + 
				this.escapeHtml(line.str[c.x]) +
				"</span>" + this.escapeHtml(line.str.substring(c.x+1, i));
		}
		else
			html += this.escapeHtml(line.str.substring(start, i));
	}
	return "<span>" + html + "</span>";
};

HtmlRenderer.prototype.toString = function() {
	var i;

	var lines = "";
	for(i = 0; i < this.buffer.height; i++) {
		lines += "<div>" + this._renderLine(i) + "</div>";
	}
	return lines + "<div style='line-height:0'>" + 
		myUtil.repeat('&nbsp;',this.buffer.width) + "</div>";
};
