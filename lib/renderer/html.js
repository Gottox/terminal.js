var inherits = require('util').inherits;

function HtmlRenderer(buffer, opts) {
	HtmlRenderer.super_.call(this, buffer, opts);
}
inherits(HtmlRenderer, require('./renderer'));
module.exports = HtmlRenderer;
