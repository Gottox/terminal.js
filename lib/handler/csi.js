// function(cmd, n, m, args, mod);

module.exports = {
	'@': function(cmd, n, m, args, mod) { // ICH - Insert the indicated # of blank characters
		this.buffer.insertBlanks(n || 1);
	},
	'A': function(cmd, n, m, args, mod) { // CUU / Move cursor up the indicated # of rows
		this.buffer.mvCur(0, -(n || 1));
	},
	'B': function(cmd, n, m, args, mod) { // CUD / Move cursor down the indicated # of rows
		this.buffer.mvCur(0, n || 1);
	},
	'C': function(cmd, n, m, args, mod) { // CUF / Move cursor right the indicated # of columns
		this.buffer.mvCur(n || 1, 0);
	},
	'D': function(cmd, n, m, args, mod) { // CUB / Move cursor left the indicated # of columns
		this.buffer.mvCur(-(n || 1), 0);
	},
	'E': function(cmd, n, m, args, mod) { // CNL / NEL / Move cursor down the indicated # of rows, to column 1
		this.buffer.mvCur(0, n || 1).setCur({x: 0});
	},
	'F': function(cmd, n, m, args, mod) { // CPL / Move cursor up the indicated # of rows, to column1
		// (vt52 compatibility mode - Use special graphics character set? )
		this.buffer.mvCur(0, -n || 1).setCur({x: 0});
	},
	'G': function(cmd, n, m, args, mod) { // CHA / Move cursor to indicated column in current row
		//vt52 compatibility mode - Use normal US/UK character set )
		this.buffer.setCur({x: (n || 1) - 1});
	},
	'H': function(cmd, args, mod, n, m) { // CUP / Move cursor to the indicated row, column (origin at 1,1)
		this.buffer.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
	},
	'I': function(cmd, n, m, args, mod) { // CHT
		this.buffer.mvTab(n || 1);
	},
	'J': function(cmd, n, m, args, mod) { // ED / DECSED / Erase display
		//J  - erase from cursor to end of display
		//0J - erase from cursor to end of display
		//1J - erase from start to cursor
		//2J - erase whole display
		this.buffer.eraseInDisplay(n || 0);
	},
	'K': function(cmd, n, m, args, mod) { // EL / DECSEL / Erase Line
		//K  - erase from cursor to end of line
		//0K - erase from cursor to end of line
		//1K - erase from start of line to cursor
		//2K - erase whole line
		this.buffer.eraseInLine(n || 0);
	},
	'L': function(cmd, n, m, args, mod) { // IL / Insert the indicated # of blank lines
		this.buffer.insertLines(n || 1);
	},
	'M': function(cmd, n, m, args, mod) { // DL / Delete the indicated # of lines
		this.buffer.deleteLines(n || 1);
	},
	'P': function(cmd, n, m, args, mod) { // DCH / Delete the indicated # of characters on the current line
		this.buffer.deleteCharacters(n || 1);
	},
	'S': function(cmd, n, m, args, mod) { // SU / Scroll Up
		this.buffer.scroll('up');
	},
	'T': function(cmd, n, m, args, mod) { // SD / Scroll Down
		if(args.length === 0)
			this.buffer.scroll('down');
		else
			console.log('Not implemented ' + cmd);
	},
	'X': function(cmd, n, m, args, mod) { // ECH / Erase the indicated # of characters on the current line
		this.buffer.eraseCharacters(n || 1);
	},
	'Z': function(cmd, n, m, args, mod) { // CBT / Cursor Backward Tab
		this.buffer.mvTab(-(n || 1));
	},
	'a': function(cmd, n, m, args, mod) { // HPR / Move cursor right the indicated # of columns
		this.buffer.mvCur(n || 1, 0);
	},
	'b': function(cmd, n, m, args, mod) { // REP / Repeat Char of Control
		// TODO
		console.log('Not implemented ' + cmd);
	},
	'c': function(cmd, n, m, args, mod) { // DA / Identify what terminal type
		this.emit("attributes", "\x1b>0;95;c");
	},
	'd': function(cmd, n, m, args, mod) { // VPA - Move cursor right the indicated row, current column
		term.setCur({y:(n || 1) - 1});
	},
	'f': function(cmd, n, m, args, mod) { // HVP / Move cursor to the indicated row, column
		term.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
	},
	'g': function(cmd, n, m, args, mod) { // TBC / Tab clear
		// 0g = clear tab stop at the current position
		// 3g = delete all tab stops
		term.tabClear(n || 0);
	},
	'h': function(cmd, n, m, args, mod) { // SM / DECSET - Set mode
		for(i = 0; i < args.length; i++)
			this.callHandler('mode', mod+args[i], cmd === 'h');
	},
	'i': function(cmd, n, m, args, mod) { // MC - Media Copy
		// TODO
		console.log('Not implemented ' + cmd);
	},
	'l': 'h', // RM / DECRST - Reset mode
	'm': function(cmd, n, m, args, mod) { // SGR / Set attributes
		// Set graphic rendition
		for(i = 0; i < args.length; i++)
			this.callHandler('sgr', args[i]);
		if(i == 0)
			this.callHandler('sgr', 0);
	},
	'n': function(cmd, n, m, args, mod) { // DSR / Status report
		//5n - Device Status report
		//0n - Response: terminal is OK
		//3n - Response: terminal is not OK
		console.log('Not implemented ' + cmd);
	},

	'p': function(cmd, n, m, args, mod) { // pointerMode
		// TODO
		console.log('Not implemented ' + cmd);
	},
	'q': function(cmd, n, m, args, mod) { // DECLL / Set keyboard LEDs
		// 0q - turn off all four leds
		// 1q - turn on Led #1
		// 2q - turn on Led #2
		// 3q - turn on Led #3
		// 4q - turn on Led #4
		term.setLed(n);
	},
	'r': function(cmd, n, m, args, mod) { // DECSTBM / Restore DEC Private Mode Values / Set scrolling region, parameters are top and bottom row
		term.setScrollRegion((n || 1) -1, (m || term.height));
	},
	's': function(cmd, n, m, args, mod) { // Save Cursor location
		term.curSave();
	},
	't': '~', // TODO unknown
	'u': function(cmd, n, m, args, mod) { // Restore Cursor location
		term.curRest();
	},
	'`': function(cmd, n, m, args, mod) { // HPA / Move cursor to indicated column in current row
		term.setCur({x: (n || 1) - 1});
	},
	'v': '~', // DECCRA /TODO unknown
	'w': '~', // DECEFR /TODO unknown
	'x': '~', // DECREQTPARM / DECSACE / DECFRA / TODO unknown
	'y': '~', // DECRQCRA /TODO unknown
	'z': '~', // DECELR / DECERA / TODO unknown
	'{': '~', // DECSLE / DECSERA / TODO unknown
	'|': '~', // DECRQLP / TODO unknown
	'}': '~', // DECIC / TODO unknown
	'~':  function(cmd, n, m, args, mod) {// DECDC /TODO unknown
		console.log('Not implemented ' + cmd);
	}
};
