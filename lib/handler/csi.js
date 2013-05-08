// function(cmd, args, mod)

module.exports = {
	'@': function(cmd, args, mod) { // ICH - Insert the indicated # of blank characters
		term.insertBlanks(n || 1);
	},
	'A': function(cmd, args, mod) { // CUU / Move cursor up the indicated # of rows
		term.mvCur(0, -(n || 1));
	},
	'B': function(cmd, args, mod) { // CUD / Move cursor down the indicated # of rows
		term.mvCur(0, n || 1);
	},
	'C': function(cmd, args, mod) { // CUF / Move cursor right the indicated # of columns
		term.mvCur(n || 1, 0);
	},
	'D': function(cmd, args, mod) { // CUB / Move cursor left the indicated # of columns
		term.mvCur(-(n || 1), 0);
	},
	'E': function(cmd, args, mod) { // CNL / NEL / Move cursor down the indicated # of rows, to column 1
		term.mvCur(0, n || 1).setCur({x: 0});
	},
	'F': function(cmd, args, mod) { // CPL / Move cursor up the indicated # of rows, to column1
		// (vt52 compatibility mode - Use special graphics character set? )
		term.mvCur(0, -n || 1).setCur({x: 0});
	},
	'G': function(cmd, args, mod) { // CHA / Move cursor to indicated column in current row
		//vt52 compatibility mode - Use normal US/UK character set )
		term.setCur({x: (n || 1) - 1});
	},
	'H': function(cmd, args, mod) { // CUP / Move cursor to the indicated row, column (origin at 1,1)
		term.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
	},
	'I': function(cmd, args, mod) { // CHT
		term.mvTab(n || 1);
	},
	'J': function(cmd, args, mod) { // ED / DECSED / Erase display
		//J  - erase from cursor to end of display
		//0J - erase from cursor to end of display
		//1J - erase from start to cursor
		//2J - erase whole display
		term.eraseInDisplay(n || 0);
	},
	'K': function(cmd, args, mod) { // EL / DECSEL / Erase Line
		//K  - erase from cursor to end of line
		//0K - erase from cursor to end of line
		//1K - erase from start of line to cursor
		//2K - erase whole line
		term.eraseInLine(n || 0);
	},
	'L': function(cmd, args, mod) { // IL / Insert the indicated # of blank lines
		term.insertLines(n || 1);
	},
	'M': function(cmd, args, mod) { // DL / Delete the indicated # of lines
		term.deleteLines(n || 1);
	},
	'P': function(cmd, args, mod) { // DCH / Delete the indicated # of characters on the current line
		term.deleteCharacters(n || 1);
	},
	'S': function(cmd, args, mod) { // SU / Scroll Up
		term.scroll('up');
	},
	'T': function(cmd, args, mod) { // SD / Scroll Down
		if(args.length === 0)
			term.scroll('down');
		else
			console.log('Not implemented ' + cmd);
	},
	'X': function(cmd, args, mod) { // ECH / Erase the indicated # of characters on the current line
		term.eraseCharacters(n || 1);
	},
	'Z': function(cmd, args, mod) { // CBT / Cursor Backward Tab
		term.mvTab(-(n || 1));
	},
	'a': function(cmd, args, mod) { // HPR / Move cursor right the indicated # of columns
		term.mvCur(n || 1, 0);
	},
	'b': function(cmd, args, mod) { // REP / Repeat Char of Control
		// TODO
		console.log('Not implemented ' + cmd);
	},
	'c': function(cmd, args, mod) { // DA / Identify what terminal type
		if(typeof term.answer === 'function')
			term.answer(term, "\x1b>0;95;c");
		else
			console.log('device attributes requested. please implement term.answer = function(terminal, msg) { ... }');
	},
	'd': function(cmd, args, mod) { // VPA - Move cursor right the indicated row, current column
		term.setCur({y:(n || 1) - 1});
	},
	'f': function(cmd, args, mod) { // HVP / Move cursor to the indicated row, column
		term.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
	},
	'g': function(cmd, args, mod) { // TBC / Tab clear
		// 0g = clear tab stop at the current position
		// 3g = delete all tab stops
		term.tabClear(n || 0);
	},
	'h': function(cmd, args, mod) { // SM / DECSET - Set mode
		for(i = 0; i < args.length; i++)
			this.callHandler('mode', mod+args[i], cmd === 'h');
	},
	'i': function(cmd, args, mod) { // MC - Media Copy
		// TODO
		console.log('Not implemented ' + cmd);
	},
	'l': 'h', // RM / DECRST - Reset mode
	'm': function(cmd, args, mod) { // SGR / Set attributes
		// Set graphic rendition
		for(i = 0; i < args.length; i++)
			this.callHandler('sgr', args[i]);
		if(i == 0)
			this.callHandler('sgr', 0);
	},
	'n': function(cmd, args, mod) { // DSR / Status report
		//5n - Device Status report
		//0n - Response: terminal is OK
		//3n - Response: terminal is not OK
		console.log('Not implemented ' + cmd);
	},

	'p': function(cmd, args, mod) { // pointerMode
		// TODO
			console.log('Not implemented ' + cmd);
	},
	'q': function(cmd, args, mod) { // DECLL / Set keyboard LEDs
		// 0q - turn off all four leds
		// 1q - turn on Led #1
		// 2q - turn on Led #2
		// 3q - turn on Led #3
		// 4q - turn on Led #4
		term.setLed(n);
	},
	'r': function(cmd, args, mod) { // DECSTBM / Restore DEC Private Mode Values / Set scrolling region, parameters are top and bottom row
		if(args.length == 2) {
			term.setScrollRegion((n || 1) -1, (m || term.height));
		}
		//else
			//	TODO
	},
	's': function(cmd, args, mod) { // Save Cursor location
		if(args.length === 0)
			term.curSave();
		//else
			//	TODO
	},
	't': '~', // TODO unknown
	'u': function(cmd, args, mod) { // Restore Cursor location
		if(args.length === 0)
			term.curRest();
		//else
			//	TODO
	},
	'`': function(cmd, args, mod) { // HPA / Move cursor to indicated column in current row
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
	'~':  function(cmd, args, mod) {// DECDC /TODO unknown
		console.log('Not implemented ' + cmd);
	}
};
