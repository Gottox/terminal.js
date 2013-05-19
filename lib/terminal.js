var myUtil = require('./util.js');

function Terminal(target, width, height, opts) {
	this._opts = opts || {};
	this.buffer = new Terminal.TermBuffer(width, height, this._opts);
	this.writer = new Terminal.TermWriter(this.buffer);

	this.renderer = this._createRenderer(target);
	this.inputs = this._createInputs(target);
}
module.exports = Terminal;

Terminal.prototype._createRenderer = function(target) {
	var Renderer;
	for(var k in Terminal.renderer) {
		Renderer = Terminal.renderer[k];
		if(Renderer.canHandle && Renderer.canHandle(target)) {
			return new Renderer(this.buffer, this.writer, target, this._opts);
		}
	}
	return new Terminal.renderer.PlainRenderer(this.buffer, this.writer, null, this._opts);
};

Terminal.prototype._createInputs = function(target) {
	// TODO
	return null;
};

Terminal.prototype.toString = function() {
	return this.renderer.toString();
};

module.exports = Terminal;
