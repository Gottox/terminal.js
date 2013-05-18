var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var pty = require('pty.js');

var server = http.createServer(function (req, res) {
	switch(req.url) {
	case '/terminal.js':
		res.writeHead(200, {"Content-Type": "text/javascript; charset=utf-8"});
		fs.createReadStream(__dirname + '/../../dist/terminal.js').pipe(res);
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

socketio.listen(server)
	.on('connection', function(socket) {
		var term = pty.spawn('sh', [ __dirname + "/hello.sh" ], {
			name: 'screen',
			cols: 80,
			rows: 30
		});

		term.setEncoding('utf8');
		term
			.on('data', function(data) {
				socket.emit('data', data.toString('utf8'));
			})
			.on('exit', function() {
				socket.emit('exit');
			});

		socket
			.on('write', function(data) {
				pty.write(data);
			})
			.on('end', function() {
				pty.end();
			})
			.on('resize', function(w, h) {
				pty.resize(h, w);
			})
			.on('kill', function(signal) {
				pty.kill(signal);
			});
	});

console.log("See this awesomeness at http://127.0.0.1:8000/");
