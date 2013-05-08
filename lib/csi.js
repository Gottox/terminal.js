var sgr = require('./sgr');

var CSI_PATTERN = /^\x1b\[([?!>]?)([0-9;]*)([@A-Za-z`]?)/;

function parseCsi(data) {
	var match = CSI_PATTERN.exec(data);
	if(match === null)
		return null;
	return {
		args: match[2] === "" ? [] : match[2].split(';'),
		mod: match[1],
		cmd: match[3],
		offset: match[0].length
	};
}

exports.chr = "[";
exports.exec = function(term, data) {
	var i;
	var match = parseCsi(data);
	if(match === null || (match.offset != data.length && match.cmd === '')) {
		console.log("Garbaged CSI: " + (match ? data.slice(0, match.offset+1) : "unknown"));
		// Consume escape character.
		return 1;
	}
  // Find the arguments, sometimes they are left blank so we keep the empty string
	var n = match.args[0], m = match.args[1];
  if (n !== '') { n = +n; }
  if (m !== '') { m = +m; }

	switch(match.cmd) {
	case '': // Unfinished sequence.
		return 0;
	case '@': // ICH - Insert the indicated # of blank characters
		term.insertBlanks(n || 1);
		break;
	case 'A': // CUU / Move cursor up the indicated # of rows
		term.mvCur(0, -(n || 1));
		break;
	case 'B': // CUD / Move cursor down the indicated # of rows
		term.mvCur(0, n || 1);
		break;
	case 'C': // CUF / Move cursor right the indicated # of columns
		term.mvCur(n || 1, 0);
		break;
	case 'D': // CUB / Move cursor left the indicated # of columns
		term.mvCur(-(n || 1), 0);
		break;
	case 'E': // CNL / NEL / Move cursor down the indicated # of rows, to column 1
		term.mvCur(0, n || 1).setCur({x: 0});
		break;
	case 'F': // CPL / Move cursor up the indicated # of rows, to column1
    // (vt52 compatibility mode - Use special graphics character set? )
		term.mvCur(0, -n || 1).setCur({x: 0});
		break;
	case 'G': // CHA / Move cursor to indicated column in current row
    //vt52 compatibility mode - Use normal US/UK character set )
		term.setCur({x: (n || 1) - 1});
		break;
	case 'H': // CUP / Move cursor to the indicated row, column (origin at 1,1)
		term.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
		break;
	case 'I': // CHT
		term.mvTab(n || 1);
		break;
	case 'J': // ED / DECSED / Erase display
    //J  - erase from cursor to end of display
    //0J - erase from cursor to end of display
    //1J - erase from start to cursor
    //2J - erase whole display
		term.eraseInDisplay(n || 0);
		break;
	case 'K': // EL / DECSEL / Erase Line
    //K  - erase from cursor to end of line
    //0K - erase from cursor to end of line
    //1K - erase from start of line to cursor
    //2K - erase whole line
		term.eraseInLine(n || 0);
		break;
	case 'L': // IL / Insert the indicated # of blank lines
		term.insertLines(n || 1);
		break;
	case 'M': // DL / Delete the indicated # of lines
		term.deleteLines(n || 1);
		break;
	case 'P': // DCH / Delete the indicated # of characters on the current line
		term.deleteCharacters(n || 1);
		break;
	case 'S': // SU / Scroll Up
		term.scroll('up');
		break;
	case 'T': // SD / Scroll Down
		if(match.args === 0)
			term.scroll('down');
		else
			console.log('Not implemented ' + match.cmd);
		break;
	case 'X': // ECH / Erase the indicated # of characters on the current line
		term.eraseCharacters(n || 1);
		break;
	case 'Z': // CBT / Cursor Backward Tab
		term.mvTab(-(n || 1));
		break;
	case 'a': // HPR / Move cursor right the indicated # of columns
		term.mvCur(n || 1, 0);
		break;
	case 'b': // REP / Repeat Char of Control
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	case 'c': // DA / Identify what terminal type
		if(typeof term.answer === 'function')
			term.answer(term, "\x1b>0;95;c");
		else
			console.log('device attributes requested. please implement term.answer = function(terminal, msg) { ... }');
		break;
	case 'd': // VPA - Move cursor right the indicated row, current column
		term.setCur({y:(n || 1) - 1});
		break;
	case 'f': // HVP / Move cursor to the indicated row, column
		term.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
		break;
	case 'g': // TBC / Tab clear
    // 0g = clear tab stop at the current position
    // 3g = delete all tab stops
		term.tabClear(n || 0);
		break;
	case 'h': // SM / DECSET - Set mode
		for(i = 0; i < match.args.length; i++)
			setMode(term, match.mod, match.args[i], true);
		break;
	case 'i': // MC - Media Copy
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	case 'l': // RM / DECRST - Reset mode
		for(i = 0; i < match.args.length; i++)
			setMode(term, match.mod, match.args[i], false);
		break;
	case 'm': // SGR / Set attributes
    // Set graphic rendition
		sgr.exec(term, match.args);
		break;
	case 'n': // DSR / Status report
    //5n - Device Status report
    //0n - Response: terminal is OK
    //3n - Response: terminal is not OK
		console.log('Not implemented ' + match.cmd);
    break;

	case 'p': // pointerMode
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	case 'q': // DECLL / Set keyboard LEDs
    // 0q - turn off all four leds
    // 1q - turn on Led #1
    // 2q - turn on Led #2
    // 3q - turn on Led #3
    // 4q - turn on Led #4
		term.setLed(n);
		break;
	case 'r': // DECSTBM / Restore DEC Private Mode Values / Set scrolling region, parameters are top and bottom row
		if(match.args.length == 2) {
			term.setScrollRegion((n || 1) -1, (m || term.height));
    }
		//else
		//	TODO
		break;
	case 's': // Save Cursor location
		if(match.args.length === 0)
			term.curSave();
		//else
		//	TODO
		break;
	case 't': // TODO unknown
		console.log('Not implemented ' + match.cmd);
		break;
	case 'u': // Restore Cursor location
		if(match.args.length === 0)
			term.curRest();
		//else
		//	TODO
		break;
	case '`': // HPA / Move cursor to indicated column in current row
		term.setCur({x: (n || 1) - 1});
		break;
	case 'v': // DECCRA /TODO unknown
	case 'w': // DECEFR /TODO unknown
	case 'x': // DECREQTPARM / DECSACE / DECFRA / TODO unknown
	case 'y': // DECRQCRA /TODO unknown
	case 'z': // DECELR / DECERA / TODO unknown
	case '{': // DECSLE / DECSERA / TODO unknown
	case '|': // DECRQLP / TODO unknown
	case '}': // DECIC / TODO unknown
	case '~': // DECDC /TODO unknown
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	default:
		console.log("Unknown CSI-command '"+match.cmd+"'");
	}
	return match.offset;
};

var modes = {
	'4': 'insert',
	'?1': 'appKeypad',
	'?12': 'cursorBlink',
	'?1000': 'mousebtn',
	'?1002': 'mousemtn',
	'?20': 'crlf',
	'?25': 'cursor',
	'?5': 'reverse',
	'?7': 'wrap'
};

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
		if(v)
			term.setCur({x:0,y:0});
		break;
	case '?4': // Ignore
		break;
	default:
		if(modes[identifier])
			term.mode[modes[identifier]] = v;
		else
			console.log("Unknown mode: " + identifier);
	}
}
