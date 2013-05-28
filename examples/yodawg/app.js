var fs = require('fs');
var socketio = require('socket.io');
var pty = require('pty.js');
var Terminal = require('../../index.js');

var term = pty.spawn("login", [ ], {
	name: 'xterm',
	cols: 80,
	rows: 24
});
var terminal = new Terminal(80, 24, process, term);
