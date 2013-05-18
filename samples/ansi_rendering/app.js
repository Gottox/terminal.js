var TermBuffer = require("../../lib/term_buffer.js");
var TermWriter = require("../../lib/term_writer.js");
var AnsiRenderer = require("../../lib/renderer/ansi.js");
var fs = require('fs');

var term_buffer = new TermBuffer(80, 24);
var term_writer = new TermWriter(term_buffer);
term_buffer.setMode('crlf',true);

var vt100 = fs.readFileSync(process.argv[2]);
term_writer.write(vt100);
var ansi_renderer = new AnsiRenderer(term_buffer);
process.stdout.write(ansi_renderer.toString());
