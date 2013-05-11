// function(cmd, n, m, args, mod);

module.exports = {
	// CSI Ps @
	// Insert Ps (Blank) Character(s) (default = 1) (ICH)
	'@': function(cmd, n, m, args, mod) {
		this.buffer.insertBlanks(n || 1);
	},

	// CSI Ps A
	// Cursor Up Ps Times (default = 1) (CUU)
	'A': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(0, -(n || 1));
	},

	// CSI Ps B
	// Cursor Down Ps Times (default = 1) (CUD)
	'B': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(0, n || 1);
	},

	// CSI Ps C
	// Cursor Forward Ps Times (default = 1) (CUF)
	'C': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(n || 1, 0);
	},

	// CSI Ps D
	// Cursor backward Ps Times (default = 1) (CUB)
	'D': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(-(n || 1), 0);
	},

	// CSI Ps E
	// Cursor down Ps Rows, to column 1 (default = 1) (CNL , NEL)
	'E': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(0, n || 1).setCur({x: 0});
	},

	// CSI Ps F
	// Cursor Preceding Line PS Times (default = 1) (CPL)
	'F': function(cmd, n, m, args, mod) {
		// (vt52 compatibility mode - Use special graphics character set? )
		this.buffer.mvCur(0, -n || 1).setCur({x: 0});
	},

	// CSI Ps G
	// Cursor Character Absolute  [column] (default = [row,1]) (CHA)
	'G': function(cmd, n, m, args, mod) {
		//vt52 compatibility mode - Use normal US/UK character set )
		this.buffer.setCur({x: (n || 1) - 1});
	},

	// CSI Ps ; Ps H
	// Cursor Position [row;column] (default = [1,1]) (CUP)
	'H': function(cmd, n, m, args, mod) {
		this.buffer.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
	},

	// CSI Ps I
	// Cursor Forward Tabulation Ps tab stops (default = 1) (CHT)
	'I': function(cmd, n, m, args, mod) {
		this.buffer.mvTab(n || 1);
	},

	// CSI Ps J
	// Erase in Display (default = 0) (ED)
	'J': function(cmd, n, m, args, mod) {
		//J  - erase from cursor to end of display
		//0J - erase from cursor to end of display
		//1J - erase from start to cursor
		//2J - erase whole display
		this.buffer.eraseInDisplay(n || 0);
	},

	// CSI Ps K
	// Erase in Line (default = 0) (EL)
	'K': function(cmd, n, m, args, mod) {
		//K  - erase from cursor to end of line
		//0K - erase from cursor to end of line
		//1K - erase from start of line to cursor
		//2K - erase whole line
		this.buffer.eraseInLine(n || 0);
	},

	// CSI Ps L
	// Insert Ps Line(s) (default = 1) (IL)
	'L': function(cmd, n, m, args, mod) {
		this.buffer.insertLines(n || 1);
	},

	// CSI Ps M
	// Delete Ps Line(s) (default = 1) (DL)
	'M': function(cmd, n, m, args, mod) {
		this.buffer.deleteLines(n || 1);
	},

	// CSI Ps P
	// Delete Ps Character(s) (default = 1) (DCH)
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

	// CSI Ps S
	// Scroll up Ps lines (default = 1) (SU)
	'S': function(cmd, n, m, args, mod) {
    // TOD multiline
		this.buffer.scroll('up');
	},

	// CSI Ps T  Scroll down Ps lines (default = 1) (SD)
	// CSI Ps ; Ps ; Ps ; Ps ; Ps T
	// CSI > Ps; Ps T
	'T': function(cmd, n, m, args, mod) {
    // TODO multiline
    // TODO handle '>' part - titlemodes
		this.buffer.scroll('down');
	},

	// CSI Ps X
	// Erase Ps Character(s) (default = 1) (ECH)
	'X': function(cmd, n, m, args, mod) {
		this.buffer.eraseCharacters(n || 1);
	},

	// CSI Ps Z
	// Cursor Backward Tabulation Ps tab stops (default = 1) (CBT)
	'Z': function(cmd, n, m, args, mod) {
		this.buffer.mvTab(-(n || 1));
	},

	// CSI Ps a
	// Move cursor right the indicated # of columns (default = 1) (HPR)
	'a': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(n || 1, 0);
	},

	// CSI Ps b
	// Repeat the preceding graphic character Ps times (REP)
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

	// CSI Pm d
	// Line Position Absolute  [row] (default = [1,column]) (VPA)
	'd': function(cmd, n, m, args, mod) {
		this.buffer.setCur({y:(n || 1) - 1});
	},

	// CSI Pm e
	// Vertical position relative
	// Move cursor down the indicated # of rows (default = 1) (VPR)
	'e': function(cmd, n, m, args, mod) {
		this.buffer.mvCur(0, n || 1);
	},

	// CSI Ps ; Ps f
	// Horizontal and Vertical Position [row;column] (default =  [1,1]) (HVP)
	'f': function(cmd, n, m, args, mod) {
		this.buffer.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
	},

	// CSI Ps g
	// Tab Clear (default = 0) (TBC)
	'g': function(cmd, n, m, args, mod) {
		// 0g = clear tab stop at the current position
		// 3g = delete all tab stops
		this.buffer.tabClear(n || 0);
	},

	// CSI Pm h
	// Set Mode (SM)
	// CSI ? Pm h - mouse escape codes, cursor escape codes
	'h': function(cmd, n, m, args, mod) {
		for(i = 0; i < args.length; i++)
			this.callHandler('mode', mod+args[i], true);
	},

	// CSI Pm i  Media Copy (MC)
	// CSI ? Pm i
	'i': function(cmd, n, m, args, mod) {
		// TODO
		console.log('Not implemented ' + cmd);
	},

	// CSI Pm l  Reset Mode (RM)
	// CSI ? Pm l
	'l': function(cmd, n, m, args, mod) {
		for(i = 0; i < args.length; i++)
			this.callHandler('mode', mod+args[i], false);
	},

	// CSI Pm m
	// Character Attributes (SGR)
	// CSI > Ps; Ps m
	'm': function(cmd, n, m, args, mod) {
		// Set graphic rendition
		for(i = 0; i < args.length; i++)
			this.callHandler('sgr', args[i]);
		if(i == 0)
			this.callHandler('sgr', 0);
	},

	// CSI Ps n  Device Status Report (DSR)
	// CSI > Ps n
	'n': function(cmd, n, m, args, mod) {
		// 5n - Device Status report
		// 0n - Response: terminal is OK
		// 3n - Response: terminal is not OK
		// 6n - Request cursor position (CPR)
		console.log('Not implemented ' + cmd);
	},

	// CSI > Ps p  Set pointer mode
	// CSI ! p   Soft terminal reset (DECSTR)
	// CSI Ps$ p
	//   Request ANSI mode (DECRQM)
	// CSI ? Ps$ p
	// Request DEC private mode (DECRQM)
	// CSI Ps ; Ps " p
	'p': function(cmd, n, m, args, mod) {
		// TODO
		console.log('Not implemented ' + cmd);
	},

	// CSI Ps q
	// Load LEDs (DECLL)
	// CSI Ps SP q
	// CSI Ps " q
		// 0q - turn off all four leds
		// 1q - turn on Led #1
		// 2q - turn on Led #2
		// 3q - turn on Led #3
		// 4q - turn on Led #4
	'q': function(cmd, n, m, args, mod) {
		this.buffer.setLed(n);
	},

	// CSI Ps ; Ps r
	// Set Scrolling Region [top;bottom] (default = full size of window) (DECSTBM)
	// CSI ? Pm r
	// CSI Pt; Pl; Pb; Pr; Ps$ r
	'r': function(cmd, n, m, args, mod) {
		// TODO handle ? prefix, $ ends
		this.buffer.setScrollRegion((n || 1) -1, (m || this.buffer.height));
	},

	// CSI ? Pm s
	// Save cursor (ANSI.SYS)
	's': function(cmd, n, m, args, mod) {
		this.buffer.curSave();
	},

	// CSI t
	// TODO unknown
	't': function(cmd, n, m, args, mod) {
		// TODO
		console.log('Not implemented ' + cmd);
	},

	// CSI Ps SP u
	// Restore cursor (ANSI.SYS)
	'u': function(cmd, n, m, args, mod) {
		this.buffer.curRest();
	},

	// CSI Pt; Pl; Pb; Pr; Pp; Pt; Pl; Pp$ v
	// (DECCRA)
	'v': function(cmd, n, m, args, mod) {
		// TODO
		console.log('Not implemented ' + cmd);
	},

	// CSI Pt ; Pl ; Pb ; Pr ' w
	// (DECEFR)
	'w': function(cmd, n, m, args, mod) {
		// TODO
		console.log('Not implemented ' + cmd);
	},

	// CSI Ps x  Request Terminal Parameters (DECREQTPARM)
	// CSI Ps x  Select Attribute Change Extent (DECSACE)
	// CSI Pc; Pt; Pl; Pb; Pr$ x
	'x': function(cmd, n, m, args, mod) {
		// TODO
		console.log('Not implemented ' + cmd);
	},

	// Request Checksum of Rectangular Area
	// DECRQCRA
	'y': function(cmd, n, m, args, mod) {
		// TODO
		console.log('Not implemented ' + cmd);
	},

	// CSI Ps ; Pu ' z
	// CSI Pt; Pl; Pb; Pr$ z
	// (DECELR) / (DECERA)
	// Erase rectangular area
	'z': function(cmd, n, m, args, mod) {
		// TODO
		console.log('Not implemented ' + cmd);
	},

	// CSI Pm `  Character Position Absolute
	//   [column] (default = [row,1]) (HPA)
	'`': function(cmd, n, m, args, mod) {
		this.buffer.setCur({x: (n || 1) - 1});
	},

	// CSI Pm ' {
	// CSI Pt; Pl; Pb; Pr$ {
	// Selectively erase retangular area (DECSLE) / (DECSERA)
	'{': function(cmd, n, m, args, mod) {K
		console.log('Not implemented ' + cmd);
	},
	

	// CSI Ps ' |
	// Request locator position (DECRQLP)
	'|': function(cmd, n, m, args, mod) {
		console.log('Not implemented ' + cmd);
	},

	// CSI P m SP }
	// Insert P s Column(s) (default = 1) (DECIC), VT420 and up
	'}': function(cmd, n, m, args, mod) {
		console.log('Not implemented ' + cmd);
	},

	// CSI P m SP ~
	// Delete P s Column(s) (default = 1) (DECDC), VT420 and up
	'~': function(cmd, n, m, args, mod) {
		console.log('Not implemented ' + cmd);
	}
};
