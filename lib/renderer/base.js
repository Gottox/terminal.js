var myUtil = require('../util.js');

function BaseRenderer(buffer) {
	var opts = arguments[Math.max(1, arguments.length - 1)];
	this.buffer = buffer;
	this._opts = myUtil.extend({}, this._defOpts, opts);
}
module.exports = BaseRenderer;

BaseRenderer.prototype.toString = function() {
	throw new Event('toString is not implemented!');
};
