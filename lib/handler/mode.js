// function(cmd, value)
function mode(s) {
	return function(cmd, value) {
		this.buffer.mode[s] = value;
	}
}
var modes = {
	'4': mode('insert'),
	'?1': mode('appKeypad'),
	'?5': mode('reverse'),
	'?7': mode('wrap'),
	'?12': mode('cursorBlink'),
	'?20': mode('crlf'),
	'?25': mode('cursor'),
	'?1000': mode('mousebtn'),
	'?1002': mode('mousemtn'),

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
