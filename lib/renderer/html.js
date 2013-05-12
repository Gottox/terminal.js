var inherits = require('util').inherits;

function HtmlRenderer(buffer, opts) {
	this.constructor.super_.call(this, buffer, opts);
}
inherits(HtmlRenderer, require('./renderer'));
module.exports = HtmlRenderer;
