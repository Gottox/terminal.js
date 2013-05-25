var Terminal = require("../../index.js");
var fs = require('fs');

var terminal = new Terminal(80, 24, 'ansi');
terminal.buffer.setMode('crlf',true);

var vt100 = fs.readFileSync(process.argv[2]);
terminal.writer.write(vt100);
process.stdout.write(terminal.toString());
