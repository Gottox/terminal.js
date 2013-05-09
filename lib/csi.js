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
		// Consume escape character
		return 1;
	}

  // Find the arguments, sometimes they are left blank 
	// an empty string indicates we should apply defaults
	var n = match.args[0], m = match.args[1];
  if (n !== '') { n = +n; }
  if (m !== '') { m = +m; }

	switch(match.cmd) {

	// Unfinished sequence
	case '':
		return 0;

	// CSI Ps @
	// Insert Ps (Blank) Character(s) (default = 1) (ICH)
	case '@':
		term.insertBlanks(n || 1);
		break;

	// CSI Ps A
	// Cursor Up Ps Times (default = 1) (CUU)
	case 'A':
		term.mvCur(0, -(n || 1));
		break;

	// CSI Ps B
	// Cursor Down Ps Times (default = 1) (CUD)
	case 'B':
		term.mvCur(0, n || 1);
		break;

	// CSI Ps C
	// Cursor Forward Ps Times (default = 1) (CUF)
	case 'C':
		term.mvCur(n || 1, 0);
		break;

	// CSI Ps D
	// Cursor backward Ps Times (default = 1) (CUB)
	case 'D':
		term.mvCur(-(n || 1), 0);
		break;

	// CSI Ps E
	// Cursor down Ps Rows, to column 1 (default = 1) (CNL , NEL)
	case 'E':
		term.mvCur(0, n || 1).setCur({x: 0});
		break;

	// CSI Ps F
	// Cursor Preceding Line PS Times (default = 1) (CPL)
	// (vt52 compatibility mode - Use special graphics character set? )
	case 'F':
		term.mvCur(0, -n || 1).setCur({x: 0});
		break;

	// CSI Ps G
	// Cursor Character Absolute  [column] (default = [row,1]) (CHA)
	// vt52 compatibility mode - Use normal US/UK character set )
	// TODO - does this work correct if no setting is specified?
	case 'G':
		term.setCur({x: (n || 1) - 1});
		break;

	// CSI Ps ; Ps H
	// Cursor Position [row;column] (default = [1,1]) (CUP)
	case 'H':
		term.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
		break;

	// CSI Ps I
	// Cursor Forward Tabulation Ps tab stops (default = 1) (CHT)
	case 'I':
		term.mvTab(n || 1);
		break;

	// CSI Ps J
	// Erase in Display (default = 0) (ED)
	//
	// J  - erase from cursor to end of display
	// 0J - erase from cursor to end of display
	// 1J - erase from start to cursor
  // 2J - erase whole display
	case 'J':
		term.eraseInDisplay(n || 0);
		break;

	// CSI Ps K
	// Erase in Line (default = 0) (EL)
  //
	// K  - erase from cursor to end of line
	// 0K - erase from cursor to end of line
	// 1K - erase from start of line to cursor
	// 2K - erase whole line
	case 'K':
		term.eraseInLine(n || 0);
		break;

	// CSI Ps L
	// Insert Ps Line(s) (default = 1) (IL)
	case 'L':
		term.insertLines(n || 1);
		break;

	// CSI Ps M
	// Delete Ps Line(s) (default = 1) (DL)
	case 'M':
		term.deleteLines(n || 1);
		break;

	// CSI Ps P
	// Delete Ps Character(s) (default = 1) (DCH)
	case 'P':
		term.deleteCharacters(n || 1);
		break;

	// CSI Pl ; Pc R
	// Report cursor position (CPR)
	// Pl indicates what line the cursor is on
	// Pr indicated what row the cursor is on
	case 'R':
			//TODO
	break;

	// CSI Ps S
	// Scroll up Ps lines (default = 1) (SU)
	case 'S':
		// TODO implement multiple lines
		term.scroll('up');
		break;


	// CSI Ps T  Scroll down Ps lines (default = 1) (SD)
	// CSI Ps ; Ps ; Ps ; Ps ; Ps T
	// CSI > Ps; Ps T
	case 'T':
		// TODO handle '>' part - titlemodes
		if(match.args === 0)
			term.scroll('down');
		else
			console.log('Not implemented ' + match.cmd);
		break;
		
	// CSI Ps X
	// Erase Ps Character(s) (default = 1) (ECH)
	case 'X':
		term.eraseCharacters(n || 1);
		break;

	// CSI Ps Z
	// Cursor Backward Tabulation Ps tab stops (default = 1) (CBT)
	case 'Z':
		term.mvTab(-(n || 1));
		break;

	// CSI Ps a
	// Move cursor right the indicated # of columns (default = 1) (HPR)
	case 'a':
		term.mvCur(n || 1, 0);
		break;

	// CSI Ps b
  // Repeat the preceding graphic character Ps times (REP)
	case 'b':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;

  // CSI P s c
	// Send Device Attributes (Primary DA)
	// CSI > P s c
	// Send Device Attributes (Secondary DA)
	case 'c':
		if(typeof term.answer === 'function')
			term.answer(term, "\x1b>0;95;c");
		else
			console.log('device attributes requested. please implement term.answer = function(terminal, msg) { ... }');
		break;

	// CSI Pm d
	// Line Position Absolute  [row] (default = [1,column]) (VPA)
	case 'd':
		term.setCur({y:(n || 1) - 1});
		break;

  // CSI Pm e
	// Vertical position relative
	// Move cursor down the indicated # of rows (default = 1) (VPR)
	case 'e':
		term.mvCur(0, n || 1);
		break;

	// CSI Ps ; Ps f
	//   Horizontal and Vertical Position [row;column] (default =  [1,1]) (HVP)
	case 'f':
		term.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
		break;

	// CSI Ps g
	// Tab Clear (default = 0) (TBC)
  //
	// 0g = clear tab stop at the current position
	// 3g = delete all tab stops
	case 'g': // TBC / Tab clear
		term.tabClear(n || 0);
		break;

	// CSI Pm h
	// Set Mode (SM)
	// CSI ? Pm h - mouse escape codes, cursor escape codes
	// TODO Special ? modes
	case 'h': // SM / DECSET - Set mode
		for(i = 0; i < match.args.length; i++)
			setMode(term, match.mod, match.args[i], true);
		break;

	// CSI Pm i  Media Copy (MC)
	// CSI ? Pm i
	case 'i':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;

	// CSI Pm l  Reset Mode (RM)
	// CSI ? Pm l
	case 'l':
		for(i = 0; i < match.args.length; i++)
			setMode(term, match.mod, match.args[i], false);
		break;

	// CSI Pm m
	// Character Attributes (SGR)
	// CSI > Ps; Ps m
	case 'm':
		sgr.exec(term, match.args);
		break;

	// CSI Ps n  Device Status Report (DSR)
	// CSI > Ps n
  // 5n - Device Status report
  // 0n - Response: terminal is OK
  // 3n - Response: terminal is not OK
	// 6n - Request cursor position (CPR)
	case 'n':
		console.log('Not implemented ' + match.cmd);
    break;

	// CSI > Ps p  Set pointer mode
	// CSI ! p   Soft terminal reset (DECSTR)
	// CSI Ps$ p
	//   Request ANSI mode (DECRQM)
	// CSI ? Ps$ p
	//   Request DEC private mode (DECRQM)
	// CSI Ps ; Ps " p
	case 'p':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;

	// CSI Ps q
	// Load LEDs (DECLL)
	// CSI Ps SP q
	// CSI Ps " q
	// 0q - turn off all four leds
  // 1q - turn on Led #1
  // 2q - turn on Led #2
  // 3q - turn on Led #3
  // 4q - turn on Led #4
	case 'q':
		term.setLed(n);
		break;

	// CSI Ps ; Ps r
	// Set Scrolling Region [top;bottom] (default = full size of window) (DECSTBM)
	// CSI ? Pm r
  // CSI Pt; Pl; Pb; Pr; Ps$ r
	case 'r':
		// TODO handle ? prefix, $ ends
		if(match.args.length == 2) {
			term.setScrollRegion((n || 1) -1, (m || term.height));
    }
		//else
		//	TODO
		break;

	// CSI s
	// Save cursor (ANSI.SYS)
	// CSI ? Pm s
	case 's':
		// TODO handle ? prefix
		if(match.args.length === 0)
			term.curSave();
		break;

	case 't': // TODO unknown
		console.log('Not implemented ' + match.cmd);
		break;

	// CSI u
	// Restore cursor (ANSI.SYS)
	// CSI Ps SP u
	case 'u':
		if(match.args.length === 0)
			term.curRest();
		//else
		//	TODO
		break;

	// CSI Pm `  Character Position Absolute
	//   [column] (default = [row,1]) (HPA)
	case '`':
		term.setCur({x: (n || 1) - 1});
		break;

	// CSI P m SP ~
	// Delete P s Column(s) (default = 1) (DECDC), VT420 and up
	case '~':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;

	// CSI Ps x  Request Terminal Parameters (DECREQTPARM)
	// CSI Ps x  Select Attribute Change Extent (DECSACE)
	// CSI Pc; Pt; Pl; Pb; Pr$ x
	case 'x':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;

	// CSI P m SP }
	// Insert P s Column(s) (default = 1) (DECIC), VT420 and up
	case '}':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;

	// CSI Pt; Pl; Pb; Pr; Pp; Pt; Pl; Pp$ v
	// (DECCRA)
	case 'v':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;

	// CSI Pt ; Pl ; Pb ; Pr ' w
	// (DECEFR)
	case 'w':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;

  // Request Checksum of Rectangular Area
	// DECRQCRA
	case 'y':
		console.log('Not implemented ' + match.cmd);
		break;

	// CSI Ps ; Pu ' z
	// CSI Pt; Pl; Pb; Pr$ z
	// (DECELR) / (DECERA)
	// Erase rectangular area
	case 'z':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;

	// CSI Pm ' {
	// CSI Pt; Pl; Pb; Pr$ {
  // Selectively erase retangular area
	// (DECSLE) / (DECSERA)
	case '{':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;

  // CSI Ps ' |
	// Request locator position
	// DECRQLP
	case '|':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;

	default:
		console.log("Unknown CSI-command '"+match.cmd+"'");
	}
	return match.offset;
};

var modes = {
	'?1': 'appKeypad', // Cursor Key Mode - Application
	// '?3': '132col', // Column mode - 132 col
	'4': 'insert',
	// '?4': 'insert', // Scrolling Mode - Smooth
	'?5': 'reverse', // Screen Mode - Reverse
	//'?6': 'relative', // Origin Mode - Relative
	'7': 'wrap' , // Wraparound - On
	'?7': 'wrap' , // Wraparound - On
	//'?8': 'autorepeat', // Auto Repeat - On
	'?12': 'cursorBlink', // Blink Cursor
	'?20': 'crlf', // Automatic Linefeed Mode
	'20': 'crlf', // Automatic Linefeed Mode
	// '34': // Normal Cursor visibility
	'?25': 'cursor', // Visible Cursor
	//'?9': 'interlace', // mouse tracking
	'?1000': 'mousebtn', // VT200 Mouse tracking
	'?1002': 'mousemtn'
	// '?1047':  Alternate Screen (new xterm code)
	// '?1049':  Alternate Screen (new xterm code)
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
