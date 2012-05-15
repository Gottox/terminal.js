exports.chr = "";
exports.exec = function(term, data) {
	switch(data[1]) {
	case '(':
	case ')':
		if(data[2] === undefined)
			return 0;
		term.mode.graphic = data[2] === '0';
		return 3;
	case 'c':
		term.reset();
		return 2;
	case 'D':
		term.inject('\x84');
		return 2;
	case 'E':
		if(!term.mvCur(0, 1))
			term.insertLine(true);
		//term.write('\x85');
		return 2;
	case 'H':
		term.tabSet();
		return 2;
	case 'M':
		if(!term.mvCur(0, -1))
			term.insertLine();
		//term.write('\x8d');
		return 2;
	case 'N':
		term.write('\x8e');
		return 2;
	case 'O':
		term.write('\x8f');
		return 2;
	case 'P':
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
	case 'Z':
		term.write('\x9a');
		return 2;
	case '[':
		term.write('\x9b');
		return 2;
	case '\\':
		term.write('\x9c');
		return 2;
	case ']':
		term.write('\x9d');
		return 2;
	case '^':
		term.write('\x9e');
		return 2;
	case '_':
		term.write('\x9f');
		return 2;
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
		}
		return 3;
	case '=':
	case '<':
	case '>':
		return 2;
	default:
		console.log("unknown escape character " + data[1]);
		return 1;
	}
}
