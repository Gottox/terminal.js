var inherits = require('util').inherits;
var myUtil = require('./util.js');

function Terminal(target, pty, width, height, opts) {
	this._opts = opts || {};
	this.buffer = new Terminal.TermBuffer(width, height, this._opts);
	this.writer = new Terminal.TermWriter(this.buffer);
	

	var Pty = this._findHandler(Terminal.pty, pty, null);
	var Renderer = this._findHandler(Terminal.renderer, target, 'PlainRenderer');
	var Input = this._findHandler(Terminal.input, target);

	this.pty = Pty ? new Pty(this.writer, pty, opts) : null;
	this.renderer = Renderer ? new Renderer(this.buffer, this.writer, target, opts) : null;
	this.input = Input ? new Input(target, this.pty, opts) : null;

	var self = this;
	this.writer.on('finish', function() {
		self.end();
	});
}
inherits(Terminal, require('events').EventEmitter);
module.exports = Terminal;

Terminal.prototype._findHandler = function(obj, target, def) {
	var Cls;
	for(var k in obj) {
		Cls = obj[k];
		if(Cls.canHandle && Cls.canHandle(target)) {
			return Cls;
		}
	}
	return null;
};

Terminal.prototype.end = function() {
	// TODO cleanup
};

Terminal.prototype.toString = function() {
	return this.renderer.toString();
};

module.exports = Terminal;
