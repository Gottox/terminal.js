module.exports = require("./lib/terminal.js");

module.exports.TermBuffer = require("./lib/term_buffer.js");
module.exports.TermDiff = require("./lib/term_diff.js");
module.exports.TermPatch = require("./lib/term_patch.js");
module.exports.TermWriter = require("./lib/term_writer.js");
module.exports.output = {
	PlainOutput: require("./lib/output/plain.js"),
	AnsiOutput: require("./lib/output/ansi.js"),
	HtmlOutput: require("./lib/output/html.js"),
	DomOutput: require("./lib/output/dom.js")
};

module.exports.source = {
	EmitterSource: require("./lib/source/emitter.js")
};

module.exports.input = {
	DomInput: require('./lib/input/dom.js')
};
