var TermBuffer = require("../lib/term_buffer.js");
var TermWriter = require("../lib/term_writer.js");
var HtmlRenderer = require("../lib/renderer/html.js");
var http = require('http');
var fs = require('fs')

var term_buffer = new TermBuffer(80, 24, {bg:0, fg:7});
var term_writer = new TermWriter(term_buffer);
term_buffer.setMode('crlf',true);

var vt100 = fs.readFileSync(__dirname + '/data/vt100test.txt');
term_writer.write(vt100);
var html_renderer = new HtmlRenderer(term_buffer);


http.createServer(function (request, response) {
	term_buffer.setMode('crlf',true);
	response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
	response.end(
		"<body style='background:silver;'>"+
		"<div style='display:inline-block;background:black;color:white;'>"+
		html_renderer.toString()+
		"</div>"+
		"</body>"
	);
}).listen(8000);

console.log("See this awesomeness at http://127.0.0.1:8000/");
