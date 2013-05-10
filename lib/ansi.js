exports.chr = "";
	
exports.exec = function(term, data) {
	switch(data[1]) {

	// ESC c
	// Full Reset (RIS)
	case 'c':
		term.reset();
		return 2;

	// ESC D
	// Index ( IND is 0x84)
	case 'D':
		term.inject('\x84');
		return 2;

	// ESC E
	// Next Line (NEL is 0x85)
	case 'E':
		if(!term.mvCur(0, 1))
			term.insertLines(1);
		return 2;

	// ESC H
	// Tab Set (HTS i 0x88)
	case 'H':
		term.tabSet();
		return 2;

	// ESC M
	// Reverse Index ( RI is 0x8d)
	case 'M':
		if(term.cursor.y == term.scrollRegion[0])
			term.scroll('up');
		else
			term.mvCur(0, -1);
		return 2;

	// ESC N
	// Single Shift Select of G2 Character Set (SS2 is 0x8e). This affects next character only
	case 'N':
		term.write('\x8e');
		return 2;

	// ESC O
	// Single Shift Select of G3 Character Set (SS3 is 0x8f). This affects next character only
	case 'O':
		term.write('\x8f');
		return 2;

	// ESC P
	// Device Control String (DCS is 0x90)
	case 'P':
		//TODO invoke DCS sequence
		term.write('\x90');
		return 2;

	case 'V':
		term.write('\x96');
		return 2;

	case 'W':
		term.write('\x97');
		return 2;

	case 'X':
		term.write('\x98');
		return 2;

	// ESC Z
	// DECID Dec Private identification
	// The kernel returns the string ESC [ ? 6 c , claiming it is a VT102
	case 'Z':
		term.write('\x9a');
		return 2;

	case 'g':
		//TODO
		return 2;

	// ESC n
	// Invoke the G2 Character Set as GL (LS2)
	case 'n':
		//TODO
		return 2;

	// ESC o
	// Invoke the G3 Character Set as GL (LS3)
	case 'o':
		//TODO
		return 2;

	// ESC 7
	// Save Cursor (DECSC)
	case '7':
		term.saveCursor();
		return 2;

	// ESC 8 
	// Restore Cursor (DECRC)
	case '8':
		term.restoreCursor();
		return 2;

	// ESC |
	// Invoke the G3 Character Set as GR (LS3R)
	case '|':
		//TODO
		return 2;

	case '[':
		term.write('\x9b');
		return 2;

	// ESC ]
	// Operating System Command (OSC is 0x9d)
	//
	// ESC ] P nrrggbb
	// set palette, with parameter given in 7 hexadecimal digits after the final P :-(
	// Here n is the color (0-15), and rrggbb indicates the red/green/blue values (0-255)
	//
	// ESC ] R
	// reset palette
	case ']':
		//TODO invoke OSC
		term.write('\x9d');
		return 2;

	// ESC ^
	// Privacy Message ( PM is 0x9e)
	case '^':
		term.write('\x9e');
		return 2;

	// ESC _
	// Application Program Command ( APC is 0x9f)
	case '_':
		term.write('\x9f');
		return 2;

	// ESC %
	// Select default/utf-8 character set.
	// @ = default, G = utf-8; 8 (Obsolete)
	case '%':
		//TODO
		return 2;

	// ESC }
	// Invoke the G2 Character Set as GR (LS2R)
	case '}':
		//TODO
		return 2;

	// ESC ~
	// Invoke the G1 Character Set as GR (LS1R)
	case '~':
		//TODO
		return 2;

	// ESC (,),*,+,-,.
	// Designate G0-G2 Character Set
	// ESC (           - Start Sequence defining G0 character set
	// ESC ( B         - Select default (ISO 8859-1 mapping)
	// ESC ( 0 (or O?) - Select vt100 graphics mapping
	// ESC ( U         - Select null mapping - straight from character ROM
	// ESC ( K         - Select user mapping - the map is loaded by (mapscrn)
	case '(': // <-- this seems to get all the attention
		if(data[2] === undefined)
			return 0;
		term.mode.graphic = data[2] === '0';
		return 3;
	case ')':
	case '*':
	case '+':
	case '-':
	case '.':
		//TODO doesn't seem to match behavior of term.js
		if(data[2] === undefined)
			return 0;
		term.mode.graphic = false;
		return 3;

	case '\\':
		term.write('\x9c');
		return 2;

	//ESC /
	// Designate G3 Character Set (VT300)
	// A = ISO Latin-1 Supplemental
	// Not implemented.
	case '/':
		//TODO
		return 2;

	// ESC #
	// 3 DEC line height/width
	case '#':
		if(data[1] === undefined)
			return 0;
		var line = term.getLine();
		switch(data[1]) {
		case '3':
			line.attr.doubletop = true;
			line.changed = true;
			break;
		case '4':
			line.attr.doublebottom = true;
			line.changed = true;
			break;
		case '5':
			line.attr.doublewidth = false;
			line.changed = true;
			break;
		case '6':
			line.attr.doublewidth = true;
			line.changed = true;
			break;
		case '8':
			//TODO DECALN DEC screen alignment test - fill screen with E's
			break;
		}
		return 3;

	// ESC =
	// Application Keypad (DECPAM)
	// Serial port requested application keyboard
	case '=':
		//TODO
		return 2;

	case '<':
		return 2;

	// ESC > 
	// (set numeric keypad mode?)
	// Normal Keypad (DECPNM)
	case '>':
		//TODO
		return 2;


	default:
		console.log("unknown escape character " + data[1]);
		return 1;
	}
};
