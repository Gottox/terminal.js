// function(cmd, value)
function genMode(s) {
	return function(cmd, value) {
		this.state.setMode(s, value);
	};
}
/**
* handlers for Mode escape characters
* @enum {Function|string}
* @readonly
* @this refers to calling {@link Terminal}
*/
var mode = {
	// '0': // Error this command is ignored
	'1': genMode('appKeypad'), // Application Key Pad - Guarded Area Transmit Mode, send all (VT132) (GATM)
	// '?1': // Cursor Keys Mode (DECCKM)
	// '2': // Keyboard Action Mode , disable keyboard input (KAM)
	// '?2': // ANSI Mode, use ESC < to switch VT52 to ANSI (DECANM)
	// '3': , // Enable or disable control characters to be displayed
	// '?3': genMode('132col'), // Column mode - 132 col (DECOLM)
	'4': genMode('insert'), //  Insert/Replace Mode (IRM)
	// '?4': , // Scrolling Mode - Smooth (DECSCLM)
	//'5': // Status Report Transfer Mode, report after DCS (STRM)
	'?5': genMode('reverse'), // Screen Mode - Reverse (DECSCNM)
	//'?6': genMode('relative'), // Origin Mode, line 1 is relative to scroll region (DECOM)
	'7': genMode('wrap'), // Wraparound - On - Vertical Editing Mode (VEM)
	//'?7': // AutoWrap Mode, start newline after column 80 (DECWAM)
	//'8': // reserved
	//'?8': // Auto Repeat Mode, key will autorepeat (DECARM)
	//'9': // reserved
	//'?9': genMode('interlace'), // INterLace Mode, interlaced for taking photos
	//'10': // (HEM)
	//'?10': // EDit Mode, VT132 is in EDIT mode (DECEDM)
	//'11': // (PUM)
	//'?11': // Line Transmit Mode, ignore TTM, send line (DECLTM)
	//'12': // (SRM), // Local Echo: Send/Receive Mode
	'?12': genMode('cursorBlink'), // Blink Cursor
	//'13': // Format Effector Action Mode, FE's are stored (FEAM)
	//'?13': // Space Compression/Field Delimiting on (DECSCFDM)
	//'14': // Format Effector Transfer Mode, send only if stored (FETM)
	//'?14': // Transmit Execution Mode, transmit on ENTER (DECTEM)
	//'15': // Multiple Area Transfer Mode, send all areas (MATM)
	//'16': // Transmit Termination Mode, send scrolling region (TTM)
	//'17': // Send Area Transmit Mode, send entire buffer (SATM)
	//'18': // Tabulation Stop Mode, lines are independent (TSM)
	//'?18': // Print FormFeed mode, send FF after printscreen (DECPFF) - Print Form Feed Mode
	//'19': // Editing Boundry Mode, all of memory affected (EBM)
	//'?19': // Printer Extent Mode (DECPEX) (DECPEXT)
	'20': genMode('crlf'), // Automatic Linefeed Mode (LNM)
	// '?20': // Overstrike, overlay characters on GIGI (OV1)
	// '?21': // Local BASIC, GIGI to keyboard and screen (BA1)
	// '?22': // Host BASIC, GIGI to host computer (BA2)
	// '?23': // GIGI numeric keypad sends reprogrammable sequences (PK1)
	// '?24': // Autohardcopy before erasing or rolling GIGI screen (AH1
	'?25': genMode('cursor'), // Visible Cursor (DECTCEM)
	// '34': // Normal Cursor visibility (DECRLM)
	// '?35': // (DECHEBM) - Hebrew/N-A Keyboard Mapping
	// '?36': // (DECHEM) - Hebrew Encoding Mode
	// '?38': // (DECTEK)- TEKtronix mode graphics
	// '?42': // (DECNRCM) - Enable operation in 7-bit or 8-bit character mode
	'?47': function(cmd, value) {
		this.state.switchBuffer(value);
	},
	// '?57': // (DECNAKB) - Greek/N-A Keyboard Mapping
	// '?60': // (DECHCCM) - Page Cursor-Coupling Mode
	// '?61': // (DECVCCM) - Vertical Cursor-Coupling Mode
	// '?64': // (DECPCCM) - Page Cursor-Coupling Mode
	// '?66': // (DECNKM) - Numeric Keypad Mode
	// '?67': // (DECKBUM) - Typewriter or Data Processing Keys
	// '?68': // (DECLRMM) (DECVSSM) - Left Right Margin Mode
	// '?73': // (DECXRLMM)
	// '?95': // (DECNCSM) - Set/Reset No Clearing Screen On Column Change
	// '?96': // (DECRLCM) - Right-to-Left Copy
	// '?97': // (DECCRTSM) - Set/Reset CRT Save Mode
	// '?98': // (DECARSM) - Set/Reset Auto Resize Mode
	// '?99': // (DECMCM) - Set/Reset Modem Control Mode
	// '?100': // (DECAAM) - Set/Reset Auto Answerback Mode
	// '?101': // (DECCANSM) - Conceal Answerback Message Mode
	// '?102': // (DECNULM) - Set/Reset Ignoring Null Mode
	// '?103': // (DECHDPXM) - Set/Reset Half-Duplex Mode
	// '?104': // (DECESKM) - Enable Secondary Keyboard Language Mode
	// '?106': // (DECOSNM)
	'?1000': genMode('mousebtn'), // VT200 Mouse tracking
	'?1002': genMode('mousemtn'),

	'?1047': function(cmd, value) {
		this.state.switchBuffer(value);
	},
	'?1048': function(cmd, v) {
		if(v)
			this.state.saveCursor();
		else
			this.state.restoreCursor();
	},
	'?1049': function(cmd, v) {
		this.callHandler('mode', '1048', v);
		this.callHandler('mode', '1047', v);
		if(v)
			this.state.setCursor(0, 0);
	}
};
module.exports = mode;
