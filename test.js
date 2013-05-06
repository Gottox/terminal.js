var TermBuffer = require("./lib/terminal").TermBuffer;

var term = new TermBuffer(5, 2);

term.inject("HelloHelloHello");
console.log(term.toString(true));
