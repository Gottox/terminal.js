var Terminal = require("../../index.js");
var http = require('http');
var fs = require('fs');

var terminal = new Terminal('html', null, 80, 24);
terminal.buffer.setMode('crlf',true);

var vt100 = fs.readFileSync(__dirname + '/../data/vt100test.txt');
terminal.writer.write(vt100);


http.createServer(function (request, response) {
	response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
	response.end(
		"<body style='background:silver;'>"+
		"<div style='display:inline-block;background:black;color:white;'>"+
		terminal.toString()+
		"</div>"+
		"</body>"
	);
}).listen(8000);

console.log("See this awesomeness at http://127.0.0.1:8000/");
