// function(cmd, chunk);
module.exports = {


	
	// ESC c
	// Full Reset (RIS)
	'c': function(cmd, chunk) { 
		this.buffer.reset();
		return 2;
	},

	// ESC D
	// Index (IND is 0x84)
	// // Moves cursor down one line in same column. 
	// If cursor is at bottom margin, screen performs a scroll-up.
	'D': function(cmd, chunk) {
		this.buffer.nextLine();
		return 2;
	},

	// ESC E
	// Next Line (NEL is 0x85)
	// This sequence causes the active position to move to the first position on
	// the next line downward
	// If the active position is at the bottom margin, a scroll up is performed
	'E': function(cmd, chunk) {
		this.buffer.nextLine().setCursor(0);
		return 2;
	},

	// ESC F
	// Start of Selected Area to be sent to auxiliary output device (SSA)

	// ESC G
	// End of Selected Area to be sent to auxiliary output device (SSA)

	// ESC H
	// Tab Set (HTS is 0x88)
	'H': function(cmd, chunk) {
		this.buffer.setTab();
		return 2;
	},

	// ESC I
	// Horizontal Tab Justify, moves string to next tab position (HTJ)

	// ESC J
	// Vertical Tabulation Set at current line (VTS)

	// ESC K
	// Partial Line Down (subscript) (PLD)

	// ESC L
	// Partial Line Up (superscript) (PLU)
 
	// ESC M
	// Reverse Index (RI is 0x8d)
	// Move the active position to the same horizontal position on the preceding line. 
	// If the active position is at the top margin, a scroll down is performed
	'M': function(cmd, chunk) {
		this.buffer.prevLine();
		return 2;
	},

	// ESC N
	// Single Shift Select of G2 Character Set (SS2 is 0x8e). This affects next character only
	'N': function(cmd, chunk) {
		return 2;
	},

	// ESC O
	// Single Shift Select of G3 Character Set (SS3 is 0x8f). This affects next character only
	'O': function(cmd, chunk) {
		return 2;
	},

	// ESC P
	// Device Control String (DCS is 0x90)
	'P': function(cmd, chunk) {

		var dcs = this.parseDcs(chunk);
		if(dcs === null || dcs.cmd === '')
			return 0;
		else if(dcs.length !== chunk.length && dcs.cmd === '') {
			// TODO Garbaged DCS. report error.
			return 1;
		}

		var result = this.callHandler('dcs', dcs.cmd, +dcs.args[0], +dcs.args[1], dcs.args, dcs.mod);
		return dcs.length;
	},

	// ESC Q
	// Private Use 1 (PU1)
	'Q': function(cmd, chunk) {
		return 2;
	},

	// ESC R
	// Private Use 2 (PU2)
	'R': function(cmd, chunk) {
		return 2;
	},

	// ESC S
	// Set Transmit State (STS)
	'S': function(cmd, chunk) {
		return 2;
	},

	// ESC T
	// Cancel Character, ignore previous character (CCH)
	'T': function(cmd, chunk) {
		//TODO
		return 2;
	},

	// ESC U
	// Message Waiting, turns on an indicator on the terminal (MW)
	'U': function(cmd, chunk) {
		return 2;
	},

	// ESC V
	// Start of Protected Area (SPA)
	'V': function(cmd, chunk) {
		return 2;
	},

	// ESC W
	// End of Protected Area (EPA)
	'W': function(cmd, chunk) {
		return 2;
	},

	// ESC X
	// Reserved
	'X': function(cmd, chunk) {
		return 2;
	},

	// ESC Y
	// Reserved
	'Y': function(cmd, chunk) {
		return 2;
	},

	// ESC Z
	// DECID Dec Private identification
	// The kernel returns the string ESC [ ? 6 c , claiming it is a VT102
	'Z': function(cmd, chunk) {
		return 2;
	},

	// ESC n
	// Invoke the G2 Character Set as GL (LS2)
	'n': function(cmd, chunk) {
		// TODO
		return 2;
	},

	// ESC o
	// Invoke the G3 Character Set as GL (LS3)
	'o': function(cmd, chunk) {
		// TODO
		return 2;
	},

	// ESC 7
	// Save Cursor (DECSC)
	'7': function(cmd, chunk) {
		this.buffer.saveCursor();
		return 2;
	},

	// ESC 8
	// Restore Cursor (DECRC)
	'8': function(cmd, chunk) {
		this.buffer.restoreCursor();
		return 2;
	},

	// ESC |
	// Invoke the G3 Character Set as GR (LS3R)
	'|': function(cmd, chunk) {
		// TODO
		return 2;
	},

	// ESC [
	// Control sequence introducer (CSI)
	'[': function(cmd, chunk) {
		var csi = this.parseCsi(chunk);
		if(csi === null || csi.cmd === '')
			return 0;
		else if(csi.length !== chunk.length && csi.cmd === '') {
			// TODO Garbaged CSI. report error.
			return 1;
		}

		var result = this.callHandler('csi', csi.cmd, +csi.args[0], +csi.args[1], csi.args, csi.mod);
		//if(result === null)
		// TODO Unknown CSI. report error.
		return csi.length;
	},

	// ESC \
	// 7-bit - File Separator (FS)
	// 8-bit - String Terminator (VT125 exits graphics) (ST)
	'\\': function(cmd, chunk) {
		return 2;
	},

	// ESC ]
	// 7-bit - Group Separator (GS)
	// 8-bit - Operating System Command (OSC is 0x9d)
	']': function(cmd, chunk) {
		var osc = this.parseOsc(chunk);
		if(osc === null)
			return 0;
		else if(osc.length !== chunk.length && osc.terminated === false) {
			// TODO Garbaged OSC. report error.
			return 1;
		}

		var result = this.callHandler('osc', osc.cmd, osc.arg);
		//if(result === null)
		// TODO Unknown OSC. report error.
		return osc.length;
	},

	// ESC ^
	// Privacy Message (password verification), terminaed by ST 
	// (PM is 0x9e) (PM)
	'^': function(cmd, chunk) {
		return 2;
	},

	// ESC _
	// Application Program Command (to word processor), term by ST
	// (APC is 0x9f) (APC)
	'_': function(cmd, chunk) {
		return 2;
	},

	// ESC %
	// Select default/utf-8 character set.
	// @ = default, G = utf-8; 8 (Obsolete)
	'%': function(cmd, chunk) {
		return 2;
	},

	// ESC }
	// Invoke the G2 Character Set as GR (LS2R)
	'}': function(cmd, chunk) {
		// TODO
		return 2;
	},

	// ESC ~
	// Invoke the G1 Character Set as GR (LS1R)
	'~': function(cmd, chunk) {
		// TODO
		return 2;
	},

	// ESC ( ) * + - .
	// TODO
	'(': function(cmd, chunk) {
		if(chunk[2] === undefined)
			return 0;
		this.buffer.setMode('graphic', chunk[2] === '0');
		return 3;
	},
	')': '.',
	'*': '.',
	'+': '.',
	'-': '.',
	'.': function(cmd, chunk) {
		if(chunk[2] === undefined)
			return 0;
		this.buffer.setMode('graphic', false);
		return 3;
	},

	// ESC #
	// 3 DEC line height/width
	'#': function(cmd, chunk) {
		if(chunk[2] === undefined)
			return 0;
		var line = this.buffer.getLine();
		switch(chunk[2]) {
		case '3':
			line.attr.doubleheight = 'top';
			break;
		case '4':
			line.attr.doubleheight = 'bottom';
			break;
		case '5':
			line.attr.doubleheight =
			line.attr.doublewidth = false;
			break;
		case '6':
			line.attr.doublewidth = true;
			break;
		}
		this.buffer.setLine(line);
		return 3;
	},

	// ESC g
	// Visual Bell
	'g': function(cmd, chunk) {
		this.emit('bell', true);
		return 2;
	},

	// ESC <
	// The terminal interprets all sequences according to ANSI standards X3.64-1979 and X3.41-1974.
	// The VT52 escape sequences described in this chapter are not recognized.
	// (DECANM)
	'<': function(cmd, chunk) {
		return 2;
	},

	// ESC >
	// (set numeric keypad mode?)
	// Normal Keypad (DECPNM)
	'>': function(cmd, chunk) {
		this.buffer.setMode('appKeypad', false);
		return 2;
	},

	// ESC =
	// Application Keypad (DECPAM)
	// Serial port requested application keyboard
	'=': function(cmd, chunk) {
		this.buffer.setMode('appKeypad', true);
		return 2;
	},

};
