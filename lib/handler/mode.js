// function(cmd, value)
function mode(s) {
	return function(cmd, value) {
		this.buffer.mode[s] = value;
	}
}
var modes = {
	'?1': mode('appKeypad'), // Cursor Key Mode - Application
	// '?3': mode('132col'), // Column mode - 132 col
	'4': mode('insert'),
	// '?4': mode('insert'), // Scrolling Mode - Smooth
	'?5': mode('reverse'), // Screen Mode - Reverse
	//'?6': mode('relative'), // Origin Mode - Relative
	'7': mode('wrap'), // Wraparound - On
	'?7': mode('wrap'), // Wraparound - On
	//'?8': mode('autorepeat'), // Auto Repeat - On
	'?12': mode('cursorBlink'), // Blink Cursor
	'?20': mode('crlf'), // Automatic Linefeed Mode
	'20': mode('crlf'), // Automatic Linefeed Mode
	// '34': mode(// Normal Cursor visibility
	'?25': mode('cursor'), // Visible Cursor
	//'?9': mode('interlace'), // mouse tracking
	'?1000': mode('mousebtn'), // VT200 Mouse tracking
	'?1002': mode('mousemtn'),
	// '?1047':  Alternate Screen (new xterm code)
	// '?1049':  Alternate Screen (new xterm code)

	'?4': function(cmd, v) { // Ignore
	},
	'?47': function(cmd, value) {
		term.buffer = v ? term.altBuffer : term.defaultBuffer;
	},
	'?1047': function(cmd, value) {
		term.altBuffer = [];
		term.buffer = v ? term.altBuffer : term.defaultBuffer;
	},
	'?1048': function(cmd, v) {
		if(v)
			term.saveCursor();
		else
			term.restoreCursor();
	},
	'?1049': function(cmd, v) {
		setMode(term, mod, '1048', v);
		setMode(term, mod, '1047', v);
		if(v)
			term.setCur({x:0,y:0});
	}
}
