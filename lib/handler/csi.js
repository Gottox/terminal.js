// function(cmd, n, m, args, mod);

module.exports = {
	// CSI @
	// ICH - Insert the indicated # of blank characters
	'@': function(cmd, n, m, args, mod) {
		this.buffer.insertBlanks(n || 1);
	},

	// CSI A
	// CUU / Move cursor up the indicated # of rows
	'A': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(0, -(n || 1));
	},

	// CSI B
	// CUD / Move cursor down the indicated # of rows
	'B': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(0, n || 1);
	},

	// CSI C
	// CUF / Move cursor right the indicated # of columns
	'C': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(n || 1, 0);
	},

	// CSI D
	// CUB / Move cursor left the indicated # of columns
	'D': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(-(n || 1), 0);
	},

	// CSI E
	// CNL / NEL / Move cursor down the indicated # of rows, to column 1
	'E': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(0, n || 1).setCur({x: 0});
	},

	// CSI F
	// CPL / Move cursor up the indicated # of rows, to column1
	'F': function(cmd, n, m, args, mod) {
		// (vt52 compatibility mode - Use special graphics character set? )
		this.buffer.mvCur(0, -n || 1).setCur({x: 0});
	},

	// CSI G
	// CHA / Move cursor to indicated column in current row
	'G': function(cmd, n, m, args, mod) {
		//vt52 compatibility mode - Use normal US/UK character set )
		this.buffer.setCur({x: (n || 1) - 1});
	},

	// CSI H
	// CUP / Move cursor to the indicated row, column (origin at 1,1)
	'H': function(cmd, n, m, args, mod) {
		this.buffer.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
	},

	// CSI I
	// CHT / Cursor Forward Tabulation
	'I': function(cmd, n, m, args, mod) {
		this.buffer.mvTab(n || 1);
	},

	// CSI J
	// ED / DECSED / Erase display
	'J': function(cmd, n, m, args, mod) {
		//J  - erase from cursor to end of display
		//0J - erase from cursor to end of display
		//1J - erase from start to cursor
		//2J - erase whole display
		this.buffer.eraseInDisplay(n || 0);
	},

	// CSI K
	// EL / DECSEL / Erase Line
	'K': function(cmd, n, m, args, mod) {
		//K  - erase from cursor to end of line
		//0K - erase from cursor to end of line
		//1K - erase from start of line to cursor
		//2K - erase whole line
		this.buffer.eraseInLine(n || 0);
	},

	// CSI L
	// IL / Insert the indicated # of blank lines
	'L': function(cmd, n, m, args, mod) {
		this.buffer.insertLines(n || 1);
	},

	// CSI M
	// DL / Delete the indicated # of lines
	'M': function(cmd, n, m, args, mod) {
		this.buffer.deleteLines(n || 1);
	},

	// CSI P
	// DCH / Delete the indicated # of characters on the current line
	'P': function(cmd, n, m, args, mod) {
		this.buffer.deleteCharacters(n || 1);
	},

	// CSI Pl ; Pc R
	// Report cursor position (CPR)
	// Pl indicates what line the cursor is on
	// Pr indicated what row the cursor is on
	'R': function(cmd, n, m, args, mod) {
		// TODO
	},

	// CSI S
	// SU / Scroll Up
	'S': 'T',

	// CSI T
	// SD / Scroll Down
	'T': function(cmd, n, m, args, mod) {
		this.buffer.scroll(cmd === 'T' ? 'down' : 'up');
	},

	// CSI X
	// ECH / Erase the indicated # of characters on the current line
	'X': function(cmd, n, m, args, mod) {
		this.buffer.eraseCharacters(n || 1);
	},

	// CSI Z
	// CBT / Cursor Backward Tab
	'Z': function(cmd, n, m, args, mod) {
		this.buffer.mvTab(-(n || 1));
	},

	// CSI a
	// HPR / Move cursor right the indicated # of columns
	'a': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(n || 1, 0);
	},

	// CSI b
	// REP / Repeat Char of Control
	'b': function(cmd, n, m, args, mod) {
		// TODO
		console.log('Not implemented ' + cmd);
	},

	// CSI P s c
	// Send Device Attributes (Primary DA)
	// CSI > P s c
	// Send Device Attributes (Secondary DA)
	'c': function(cmd, n, m, args, mod) {
		// TODO
		this.emit("attributes", "\x1b>0;95;c");
	},

	// CSI d
	// VPA - Move cursor right the indicated row, current column
	'd': function(cmd, n, m, args, mod) {
		term.setCur({y:(n || 1) - 1});
	},

	// CSI f
	// HVP / Move cursor to the indicated row, column
	'f': function(cmd, n, m, args, mod) {
		term.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
	},

	// CSI g
	// TBC / Tab clear
	'g': function(cmd, n, m, args, mod) {
		// 0g = clear tab stop at the current position
		// 3g = delete all tab stops
		term.tabClear(n || 0);
	},

	// CSI h
	// SM / DECSET - Set mode
	'h': function(cmd, n, m, args, mod) {
		for(i = 0; i < args.length; i++)
			this.callHandler('mode', mod+args[i], cmd === 'h');
	},

	// CSI i
	// MC - Media Copy
	'i': function(cmd, n, m, args, mod) {
		// TODO
		console.log('Not implemented ' + cmd);
	},

	// CSI l
	// RM / DECRST - Reset mode
	'l': 'h',
	// CSI m
	// SGR / Set attributes
	'm': function(cmd, n, m, args, mod) {
		// Set graphic rendition
		for(i = 0; i < args.length; i++)
			this.callHandler('sgr', args[i]);
		if(i == 0)
			this.callHandler('sgr', 0);
	},

	// CSI n
	// DSR / Status report
	'n': function(cmd, n, m, args, mod) {
		// 5n - Device Status report
		// 0n - Response: terminal is OK
		// 3n - Response: terminal is not OK
		// 6n - Request cursor position (CPR)
		console.log('Not implemented ' + cmd);
	},


	// CSI p
	// pointerMode
	'p': function(cmd, n, m, args, mod) {
		// TODO
		console.log('Not implemented ' + cmd);
	},

	// CSI q
	// DECLL / Set keyboard LEDs
	'q': function(cmd, n, m, args, mod) {
		// 0q - turn off all four leds
		// 1q - turn on Led #1
		// 2q - turn on Led #2
		// 3q - turn on Led #3
		// 4q - turn on Led #4
		term.setLed(n);
	},

	// CSI r
	// DECSTBM / Restore DEC Private Mode Values / Set scrolling region, parameters are top and bottom row
	'r': function(cmd, n, m, args, mod) {
		term.setScrollRegion((n || 1) -1, (m || term.height));
	},

	// CSI s
	// Save Cursor location
	's': function(cmd, n, m, args, mod) {
		term.curSave();
	},

	// CSI t
	// TODO unknown
	't': '~',

	// CSI u
	// Restore Cursor location
	'u': function(cmd, n, m, args, mod) {
		term.curRest();
	},

	// CSI `
	// HPA / Move cursor to indicated column in current row
	'`': function(cmd, n, m, args, mod) {
		term.setCur({x: (n || 1) - 1});
	},

	// CSI Pt; Pl; Pb; Pr; Pp; Pt; Pl; Pp$ v
	// (DECCRA)
	'v': '~',

	// CSI Pt ; Pl ; Pb ; Pr ' w
	// (DECEFR)
	'w': '~',

	// CSI Ps x  Request Terminal Parameters (DECREQTPARM)
	// CSI Ps x  Select Attribute Change Extent (DECSACE)
	// CSI Pc; Pt; Pl; Pb; Pr$ x
	'x': '~',

	// Request Checksum of Rectangular Area
	// DECRQCRA
	'y': '~',

	// CSI z
	// DECELR / DECERA / TODO unknown
	'z': '~',

	// CSI {
	// DECSLE / DECSERA / TODO unknown
	'{': '~',

	// CSI |
	// DECRQLP / TODO unknown
	'|': '~',

	// CSI P m SP }
	// Insert P s Column(s) (default = 1) (DECIC), VT420 and up
	'}': '~',

	// CSI P m SP ~
	// Delete P s Column(s) (default = 1) (DECDC), VT420 and up
	'~': function(cmd, n, m, args, mod) {
		console.log('Not implemented ' + cmd);
	}
};
