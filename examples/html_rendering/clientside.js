var Terminal = require("../../index.js");
var http = require('http');
var fs = require('fs');

var terminal = new Terminal(80, 24, 'html');
terminal.buffer.setMode('crlf',true);

var vt100 = fs.readFileSync(process.argv[2]);
var index = fs.readFileSync(__dirname + "/index.html");
terminal.writer.write(vt100);

var server = http.createServer(function (req, res) {
	switch(req.url) {
	case '/terminal.js':
		res.writeHead(200, {"Content-Type": "text/javascript; charset=utf-8"});
		fs.createReadStream(__dirname + '/../../dist/terminal.js').pipe(res);
		break;
	case '/data.js':
		res.writeHead(200, {"Content-Type": "text/javascript; charset=utf-8"});
		res.end("var data = " + JSON.stringify(vt100.toString()));
		break;
	case '/':
		res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
		fs.createReadStream(__dirname + "/index.html").pipe(res);
		break;
	default:
		res.writeHead(404, {"Content-Type": "text/plain; charset=utf-8"});
		res.end("Not found");
	}
}).listen(8000, '127.0.0.1');

console.log("See this awesomeness at http://127.0.0.1:8000/");
