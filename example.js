#!/bin/env node

var http = require('http');
	rainbow = require('ansi-rainbow').r;
	Terminal = require('./index');

var i = 0;
http.createServer(function(req, res) {
	var terminal = new Terminal();
	terminal.write(rainbow("Terminal.js call " + ++i));

	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('<pre style="display:inline-block;background:black;color:white">'+
			terminal.toString('html')+'</pre>')
	console.log(terminal.toString('ansi'));
}).listen(4000)
