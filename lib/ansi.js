exports.chr = "";
exports.exec = function(term, data) {
	switch(data[0]) {
	case '(':
	case ')':
		if(data[1] === undefined)
			return 0;
		term.attr.graphic = data[1] === '2' || data[1] === '0';
		return 2;
	case 'c':
		term.reset();
		return 1;
	case 'D':
		term.inject('\x84');
		return 1;
	case 'E':
		if(!buffer.mvCur(0, 1))
			buffer.insertLine(true);
		//buffer.write('\x85');
		return 1;
	case 'H':
		buffer.tabSet();
		return 1;
	case 'M':
		if(!buffer.mvCur(0, -1))
			buffer.insertLine();
		//buffer.write('\x8d');
		return 1;
	case 'N':
		buffer.write('\x8e');
		return 1;
	case 'O':
		buffer.write('\x8f');
		return 1;
	case 'P':
		buffer.write('\x90');
		return 1;
	case 'V':
		buffer.write('\x96');
		return 1;
	case 'W':
		buffer.write('\x97');
		return 1;
	case 'X':
		buffer.write('\x98');
		return 1;
	case 'Z':
		buffer.write('\x9a');
		return 1;
	case '[':
		buffer.write('\x9b');
		return 1;
	case '\\':
		buffer.write('\x9c');
		return 1;
	case ']':
		buffer.write('\x9d');
		return 1;
	case '^':
		buffer.write('\x9e');
		return 1;
	case '_':
		buffer.write('\x9f');
		return 1;
	case '#':
		if(data[1] === undefined)
			return 0;
		var line = buffer.getLine();
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
		return 2;
	case '=':
	case '<':
	case '>':
		return 1;
	}
	return -1;
}
