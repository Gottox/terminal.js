var Terminal = require("./lib/terminal").Terminal;

var term = new Terminal(80, 24);

term.write("Hello\x1b[H");
