var myUtil = require('../util.js');

function BaseInput(target, source) {
	var opts = arguments[Math.max(1, arguments.length - 1)];
	this.target = target;
	this.source = source;
	this._opts = myUtil.extend({}, this._defOpts, opts);
}
module.exports = BaseInput;
