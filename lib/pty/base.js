var myUtil = require('../util.js');

function BasePty(writer, pty) {
	var opts = arguments[Math.max(1, arguments.length - 1)];
	this.writer = writer;
	this.pty = pty;
	this._opts = myUtil.extend({}, this._defOpts, opts);
}
module.exports = BasePty;
