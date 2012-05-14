var Terminal = require("./lib/terminal").Terminal;

var term = new Terminal(5, 2);

term.inject("HelloHelloHello");
console.log(term.toString(true));
