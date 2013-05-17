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
				css[inverse ? "background-color" : "color"] = this._colors[attr[p]];
				break;
			case 'bg':
				css[inverse ? "color" : "background-color"] = this._colors[attr[p]];
				break;
			case 'bold':
				css["font-weight"] = "bold";
				break;
			case 'underline':
			case 'blink':
				css["text-decoration"] = (css["text-decoration"] || "") + " " + p;
				break;
		}
	}
	for(p in css) {
		html += p + ":" + css[p] + ";";
	}
	return html;
};

HtmlRenderer.prototype._mkAttr = function(attr, extra) {
	return 'style="' + this._mkCssProperties(attr) + (extra || "")+ '"';
};

HtmlRenderer.prototype._renderLine = function(nbr) {
	var i, start;
	var line = this.buffer.getLine(nbr);
	var html = "";

	for(i = 0; i < line.str.length;) {
		for(start = i++; i < line.str.length && !(i in line.attr); i++);
		html += "</span><span " + this._mkAttr(line.attr[start]) + ">" +
			line.str.substring(start, i)
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/ /g, "&nbsp;");
	}
	return "<span>" + html + "</span>";
};

HtmlRenderer.prototype.toString = function() {
	var i;

	var lines = "<pre style='font-family:monospace'><div style='line-height:0'>" + 
		Array(this.buffer.width + 1).join("&nbsp") + "</div>";
	for(i = 0; i < this.buffer.height; i++) {
		lines += this._renderLine(i) + "<br />";
	}
	return lines + "</pre>";
};
