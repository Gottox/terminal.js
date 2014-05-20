var inherits = require('util').inherits;
var myUtil = require('./util.js');

/**
* Class to set up and manage a terminal
* @constructor
* @params width {number} width of the terminal in columns
* @params height {number} height of the terminal in rows
*/
function Terminal(width, height) {
	var args = Array.prototype.slice.call(arguments, 2);
	var opts = {}, target = null, source = null;

	var lastArg = args[args.length - 1];
	if(typeof lastArg === 'object' && !('constructor' in lastArg))
		opts = args.pop();
	if(args.length >= 1)
		target = args[0];
	if(args.length >= 2)
		source = args[1];

	this._opts = opts;
	this.buffer = new Terminal.TermBuffer(width, height, this._opts);
	this.writer = new Terminal.TermWriter(this.buffer);
	

	var Source = this._findHandler(Terminal.source, source, null);
	var Output = this._findHandler(Terminal.output, target, 'PlainOutput');
	var Input = this._findHandler(Terminal.input, target);

	this.source = Source ? new Source(this.writer, source, opts) : null;
	this.output = Output ? new Output(this.buffer, this.writer, target, opts) : null;
	this.input = Input ? new Input(target, this.source, this.buffer, opts) : null;

	var self = this;
	this.writer.on('finish', function() {
		self.end();
	});
}
inherits(Terminal, require('events').EventEmitter);

/**
* finds a handler to a given target
* @param obj {object} contains all handlers
* @param target value to analyse
* @param def default handler if none can be found
* @private
*/
Terminal.prototype._findHandler = function(obj, target, def) {
	var Cls;
	for(var k in obj) {
		Cls = obj[k];
		if(Cls.canHandle && Cls.canHandle(target)) {
			return Cls;
		}
	}
	return def;
};

/**
* cleans up buffer and detaches all handlers
* @todo implement
*/
Terminal.prototype.end = function() {
	// TODO cleanup
};

/**
* resize the terminal
*/
Terminal.prototype.resize = function(w, h) {
	this.source.resize(w, h);
	this.buffer.resize(w, h);
};

/**
* builds a string representation of the terminal. The result depends on the
* choose output handler
*/
Terminal.prototype.toString = function() {
	return this.output.toString();
};

module.exports = Terminal;
