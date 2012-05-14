exports.exec = function(term, chr) {
	switch(chr) {
		case '\x07': // BELL
			// TODO
			break;
		case '\x08': // BACKSPACE
			term.mvCur(-1, 0);
			break;
		case '\x09': // TAB
			term.mvTab(1);
			break;
		case '\n': // LINEFEED
			term.lineFeed();
			break;
		case '\x0d': // CARRIAGE RETURN
			term.setCur({x:0 });
			break;
		case '\x7f': // DELETE
			term.deleteChar(1);
			break;
		case '\x88': // TABSET
			term.setTab();
			break;
		default:
			term.inject(chr);
	}
}
