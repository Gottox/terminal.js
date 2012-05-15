var sgr = require('./sgr');

var CSI_PATTERN = /^\x1b\[([?!>]?)([0-9;]*)([@A-Za-z`]?)/;

function parseCsi(data) {
	var match = CSI_PATTERN.exec(data)
	if(match === null)
		return null
	return {
		args: match[2] === "" ? [] : match[2].split(';'),
		mod: match[1],
		cmd: match[3],
		offset: match[0].length
	};
}

exports.chr = "[";
exports.exec = function(term, data) {
	var match = parseCsi(data);
	if(match === null || (match.offset != data.length && match.cmd === '')) {
		console.log("Garbaged CSI: " + (match ? data.slice(0, match.offset+1) : "unknown"));
		// Consume escape character.
		return 1;
	}
	var n = match.args[0], m = match.args[1];
	switch(match.cmd) {
	case '': // Unfinished sequence.
		return 0;
	case '@': // ICH
		term.insertBlanks(n || 1);
		break;
	case 'A': // CUU
		term.mvCur(0, -(n || 1));
		break;
	case 'B': // CUD
		term.mvCur(0, n || 1);
		break;
	case 'C': // CUF
	case 'a': // HPR
		term.mvCur(n || 1, 0);
		break;
	case 'D': // CUB
		term.mvCur(-(n || 1), 0);
		break;
	case 'E': // CNL
		term.mvCur(0, n || 1).setCur({x: 0});
		break;
	case 'F': // CPL
		term.mvCur(0, -(n || 1)).setCur({x: 0});
		break;
	case '`': // HPA
	case 'G': // CHA
		term.setCur({x: (n || 1) - 1});
		break;
	case 'f': // HVP
	case 'H': // CUP
		term.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
		break;
	case 'I': // CHT
		term.mvTab(n || 1);
		break;
	case 'J': // ED / DECSED
		term.eraseInDisplay(n);
		break;
	case 'K': // EL / DECSEL
		term.eraseInLine(n);
		break;
	case 'L': // IL
		term.insertLine(n || 1);
		break;
	case 'P': // DCH
		term.deleteChar(n || 1);
		break;
	case 'S': // SU
	case 'T': // SD / Initiate highlight mouse tracking
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	case 'X': // ECH
		term.eraseChar(n || 1);
		break;
	case 'Z': // CBT
		term.mvTab(-(n || 1));
		break;
	case 'b': // REP
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	case 'd': // VPA
		term.setCur({y:(n || 1) - 1});
		break;
	case 'g': // TBC
		term.tabClear(n);
		break;
	case 'h': // SM / DECSET
		for(var i = 0; i < match.args.length; i++)
			setMode(term, match.mod, match.args[i], true);
		break;
	case 'i': // MC
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	case 'l': // RM / DECRST
		for(var i = 0; i < match.args.length; i++)
			setMode(term, match.mod, match.args[i], false);
		break;
	case 'm': // SGR
		sgr.exec(term, match.args);
		break;
	case 'n': // DSR
	case 'p': // pointerMode
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	case 'q': // DECLL
		// TODO
		console.log('Not implemented ' + match.cmd);
		term.setLed(n);
		break;
	case 'r': // DECSTBM / Restore DEC Private Mode Values
		if(match.args.length == 2)
			term.setScrollRegion(n-1, m);
		//else
		//	TODO
		break;
	case 's': // Save Cursor
		if(match.args.length == 0)
			term.curSave();
		//else
		//	TODO
		break;
	case 't':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	case 'u': // Restore Cursor
		if(match.args.length == 0)
			term.curRest();
		//else
		//	TODO
		break;
	case 'v': // DECCRA
	case 'w': // DECEFR
	case 'x': // DECREQTPARM / DECSACE / DECFRA
	case 'y': // DECRQCRA
	case 'z': // DECELR / DECERA
	case '{': // DECSLE / DECSERA
	case '|': // DECRQLP
	case '}': // DECIC
	case '~': // DECDC
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	default:
		console.log("Unknown CSI-command '"+match.cmd+"'");
	}
	return match.offset;
}

var modes = {
	'4': 'insert',
	'?1': 'appKeypad',
	'?1000': 'mousebtn',
	'?1002': 'mousemtn',
	'?20': 'crlf',
	'?25': 'cursor',
	'?5': 'reverse',
	'?7': 'wrap',
}

function setMode(term, mod, n, v) {
	var identifier = mod+n;
	switch(identifier) {
	case '?1047':
		term.altBuffer = [];
		// No break here.
	case '?47':
		term.buffer = v ? term.altBuffer : term.defaultBuffer;
		break;
	case '?1048':
		if(v)
			term.saveCursor();
		else
			term.restoreCursor();
		break;
	case '?1049':
		setMode(term, mod, '1048', v);
		setMode(term, mod, '1047', v);
		break;
	default:
		if(modes[identifier])
			term.mode[modes[identifier]] = v;
		else
			console.log("Unknown mode: " + identifier);
	}
}
