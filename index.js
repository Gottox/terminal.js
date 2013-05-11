module.exports.TermBuffer = require("./lib/term_buffer.js");
module.exports.Terminal = exports.TermBuffer; // legacy 
module.exports.TermDiff = require("./lib/term_diff.js").TermDiff;
module.exports.TermWriter = require("./lib/term_writer.js");
module.exports.renderer = {
	PlainRenderer: require("./lib/renderer/plain.js")
}
