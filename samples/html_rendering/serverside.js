var Terminal = require("../../index.js");
var http = require('http');
var fs = require('fs');

var terminal = new Terminal(80, 24, 'html');
terminal.buffer.setMode('crlf',true);

var vt100 = fs.readFileSync(process.argv[2]);
terminal.writer.write(vt100);


http.createServer(function (request, response) {
	response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
	response.end(
		"<div style='display:inline-block;background:black;color:white;font-family:monospace'>"+
		terminal.toString()+
		"</div>"
	);
}).listen(8000);

console.log("See this awesomeness at http://127.0.0.1:8000/");
