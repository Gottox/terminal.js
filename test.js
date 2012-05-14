var Terminal = require("./lib/terminal").Terminal;

var term = new Terminal(80, 24);

term.inject("Hello");
console.log(term.toString(true));
