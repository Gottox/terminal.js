module.exports = require("./lib/terminal.js");

module.exports.TermBuffer = require("./lib/term_buffer.js");
module.exports.TermDiff = require("./lib/term_diff.js");
module.exports.TermWriter = require("./lib/term_writer.js");
module.exports.renderer = {
	PlainRenderer: require("./lib/renderer/plain.js"),
	AnsiRenderer: require("./lib/renderer/ansi.js"),
	HtmlRenderer: require("./lib/renderer/html.js"),
	DomRenderer: require("./lib/renderer/dom.js")
};
