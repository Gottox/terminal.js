var myUtil = require('../util.js');

function BaseInput(target, pty) {
	var opts = arguments[Math.max(1, arguments.length - 1)];
	this.target = target;
	this.pty = pty;
	this._opts = myUtil.extend({}, this._defOpts, opts);
}
module.exports = BaseInput;
