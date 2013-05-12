var myUtil = require('../util.js');

function BaseRenderer(buffer, opts) {
	this.buffer = buffer;
	this.opts = myUtil.extend({
		
	}, opts);
}
module.exports = BaseRenderer;

BaseRenderer.prototype.toString = function() {
	throw new Event('toString is not implemented!');
};
