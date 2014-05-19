var myUtil = require('./util.js');
var inherits = require('util').inherits;

/**
* map of graphical character aliases
* @enum
* @private
*/
var graphics = {
        '`': '\u25C6',
        'a': '\u2592',
        'b': '\u2409',
        'c': '\u240C',
        'd': '\u240D',
        'e': '\u240A',
        'f': '\u00B0',
        'g': '\u00B1',
        'h': '\u2424',
        'i': '\u240B',
        'j': '\u2518',
        'k': '\u2510',
        'l': '\u250C',
        'm': '\u2514',
        'n': '\u253C',
        'o': '\u23BA',
        'p': '\u23BB',
        'q': '\u2500',
        'r': '\u23BC',
        's': '\u23BD',
        't': '\u251C',
        'u': '\u2524',
        'v': '\u2534',
        'w': '\u252C',
        'x': '\u2502',
        'y': '\u2264',
        'z': '\u2265',
        '{': '\u03C0',
        '|': '\u2260',
        '}': '\u00A3',
        '~': '\u00B7'
};


/**
* Creates setter for a specific property
* @private
*/
function setterFor(objName) {
	return function(name, value) {
		if("_"+objName+"sCow" in this) {
			if(this["_"+objName+"sCow"] === true)
				this["_"+objName+"s"] = myUtil.extend({}, this["_"+objName+"s"]);
			this["_"+objName+"sCow"] = false;
		}
		var obj = this["_"+objName+"s"];

		if(!(name in obj))
			throw new Error("Unknown "+objName+" `"+name+"`");
		this.emit(objName+"change", name, value, obj[name]);
		obj[name] = value;
	};
}

/**
* A class which holds the terminals state and content
* @param {number} width - Width of the terminal
* @param {number} height - Height of the terminal
* @param {object} attr - initial attributes of the terminal
* @constructor
*/
function TermBuffer(width, height, attr) {
	TermBuffer.super_.call(this, {
		decodeStrings: false
	});
	this.height = height || 24;
	this.width = width || 80;

	this._defaultAttr = myUtil.extend({
		fg: null,
		bg: null,
		bold: false,
		underline: false,
		italic: false,
		blink: false,
		inverse: false
	}, attr || {});
	this._attributesCow = true;

	this.on('newListener', this._newListener);
	this.on('removeListener', this._removeListener);

	// Reset all on first use
	this.reset();
}
inherits(TermBuffer, require('stream').Writable);
module.exports = TermBuffer;

/**
* tells a new listener the terminals state when it is registered
* @param {string} ev - event name
* @param {function} cb - the listening function
* @private
*/
TermBuffer.prototype._newListener = function(ev, cb) {
	var i;
	switch(ev) {
		case 'lineinsert':
			for(i = 0; i < this.getBufferHeight(); i++)
				cb.call(this, i, this.getLine(i));
			break;
		case 'resize':
			cb.call(this, this.width, this.height);
			break;
		case 'cursormove':
			cb.call(this, this.cursor.x, this.cursor.y);
			break;
	}
};

/**
* cleans up listener when it is removed from the terminal buffer
* @param {string} ev - event name
* @param {function} cb - the listening function
* @private
*/
TermBuffer.prototype._removeListener = function(ev, cb) {
	var i;
	if(ev == 'lineremove') {
		for(i = 0; i < this.getBufferHeight(); i++)
			cb.call(this, 0, this.getLine(i));
	}
};

/**
* resets the terminals state.
*/
TermBuffer.prototype.reset = function() {
	if(this._buffer)
		this._removeLine(0, this.getBufferHeight());
	this._buffer = this._defBuffer = {
		str: [], attr: []
	};
	this._altBuffer = {
		str: [], attr: []
	};
	this._modes = {
		cursor: true,
		cursorBlink: false,
		appKeypad: false,
		wrap: true,
		insert: false,
		crlf: false,
		mousebtn: false,
		mousemtn: false,
		reverse: false,
		graphic: false
	};
	this._metas = {
		title: "",
		icon: ""
	};
	this.resetAttribute();
	this.cursor = {x:0,y:0};
	this._savedCursor = {x:0,y:0};
	this._scrollRegion = [0, this.height-1];
	this._leds = [!!0,!!0,!!0,!!0];
	this._tabs = [];

	this._lineAttr = {
		doubletop: false,
		doublebottom: false,
		doublewidth: false
	};

};

/**
* creates a new line in the buffer
* @param [line] - build line upon this value
* @private
*/
TermBuffer.prototype._createLine = function(line) {
	if(line === undefined || typeof line !== 'object') {
		line = line ? line.toString() : "";
		line = { str: line, attr: {0: this._defaultAttr} };
	}
	else if(!line || typeof line.str !== 'string' || typeof line.attr !== 'object')
		throw new Error('line objects must contain attr and str' + line);

	for(var i in line.attr) {
		if(+i > line.str.length || line.attr[i] === undefined)
			delete line.attr[i];
	}
	return line;
};

/**
* @deprecated since 0.2
* @see write
*/
TermBuffer.prototype.inject = function(str) {
	console.warn("inject() is deprecated. use write() instead.");
	this.write(str);
};

/**
* Takes a chunk of data and puts it in the buffer
* @alias TermBuffer.prototype.write
* @see http://nodejs.org/docs/latest/api/stream.html#stream_writable_write_chunk_encoding_callback
*/
TermBuffer.prototype._write = function(chunk, encoding, callback) {
	var i, j, line;
	var lines = chunk.split('\n');
	var wrapped;
	var c = this.cursor, cx;

	for(i = 0; i < lines.length; i++) {
		wrapped = false;
		// Handle long lines
		if(lines[i].length > this.width - c.x) {
			if(c.x >= this.width)
				c.x = this.width - 1;
			if(this._modes.wrap) {
				lines.splice(i, 1,
					lines[i].substr(0, this.width - c.x),
					lines[i].substr(this.width - c.x)
				);
				wrapped = true;
			}
			else {
				lines[i] = lines[i].substr(0, this.width - c.x - 1) +
					lines[i].substr(-1);
			}
		}

		// write line
		this._lineInject(lines[i]);

		if(i + 1 !== lines.length) {
			c.y++;
			if(this._modes.crlf || wrapped)
				c.x = 0;

			if(c.y > this._scrollRegion[1]) {
				c.y--;
				this._removeLine(this._scrollRegion[0]);
				this._insertLine(this._scrollRegion[1]);
			}
		}
	}
	this.setCursor();
	return callback();
};

/**
* converts graphics from ascii to utf8 characters when in graphics mode.
* @private
*/
TermBuffer.prototype._graphConvert = function(content) {
	if(this._modes.graphic) {
		var result = "";
		for(i = 0; i < content.length; i++) {
			result += (content[i] in graphics) ?
				graphics[content[i]] :
				content[i];
		}
		return result;
	} else  {
		return content;
	}
};

/**
* injects a single line into the buffer.
* @see _write
* @private
*/
TermBuffer.prototype._lineInject = function(content) {
	var c = this.cursor;
	var line = this.getLine();
	if(this._modes.insert) {
		var args = Array(content.length);
		args.unshift(line.attr, line.str.length+1, c.x, 0);
		myUtil.objSplice.apply(0, args);
		line.str = line.str.substr(0, c.x) + myUtil.repeat(' ',c.x - line.str.length) +
			this._graphConvert(content) + line.str.substr(c.x);
		line.str = line.str.substr(0, this.width);
	}
	else {
		line.str = line.str.substr(0, c.x) +
			myUtil.repeat(' ', c.x - line.str.length) +
			this._graphConvert(content) + line.str.substr(c.x + content.length);
	}

	this._applyAttributes(line, c.x, content.length);
	this.setLine(line);

	c.x += content.length;
};

/**
* removes characters at cursor position.
* @params {number} count - number of characters to be removed
*/
TermBuffer.prototype.removeChar = function(count) {
	var c = this.cursor, line = this.getLine(c.y);
	var last = line.attr[line.str.length];
	myUtil.objSplice(line.attr, line.str.length+1, c.x, count);
	line.str = line.str.substr(0, c.x) + line.str.substr(c.x+count);
	line.attr[line.str.length] = last;
	this.setLine(c.y, line);
};

/**
* inserts whitespaces at cursor position
* @params {number} count - number of whitespaces to be inserted
*/
TermBuffer.prototype.insertBlank = function(count) {
	var c = this.cursor, line = this.getLine(c.y);
	var last = line.attr[line.str.length];
	myUtil.objSplice(line.attr, line.str.length+1, c.x, 0, Array(count));
	line.str = line.str.substr(0, c.x) +
		myUtil.repeat(' ', count) + line.str.substr(c.x+count);
	line.attr[line.str.length] = last;
	this.setLine(c.y, line);
};

/**
* removes lines at cursor position.
* @params {number} count - number of lines to be removed
*/
TermBuffer.prototype.removeLine = function(count) {
	this._removeLine(this.cursor.y, +count);
	if(this._scrollRegion[1] !== this.height-1 && this.cursor.y <= this._scrollRegion[1])
		this._insertLine(this._scrollRegion[1] + 1 - count, +count);
};

/**
* removes lines at given position
* @params {number} line - line number to start removing
* @params {number} count - number of lines to be removed
* @private
*/
TermBuffer.prototype._removeLine = function(line, count) {
	var i;
	if(count === undefined)
		count = 1;
	var str = this._buffer.str.splice(line, count);
	var attr = this._buffer.attr.splice(line, count);
	for(i = 0; i < str.length; i++)
		this.emit('lineremove', line, {str: str[i], attr: attr[i] });
	return count;
};

/**
* sets the line to a value and emits 'linechanged' event
* @params {number} nbr - line number to set
* @params {object} line - line content to set
*/
TermBuffer.prototype.setLine = function(nbr, line) {
	if(typeof nbr === 'object' && line === undefined) {
		line = nbr;
		nbr = this.cursor.y;
	}
	line = this._createLine(line);
	if(this._buffer.str.length <= nbr) {
		this._insertLine(nbr, line);
	}
	else {
		if(line.str.length > this.width)
			line.attr[this.width] = line.attr[line.str.length];
		this._buffer.str[nbr] = line.str.substr(0, this.width);
		this._buffer.attr[nbr] = line.attr;
		this.emit('linechange', nbr, line);
	}
};

/**
* inserts lines at cursor position
* @params {number} count - number of lines to insert
*/
TermBuffer.prototype.insertLine = function(count) {
	this._insertLine(this.cursor.y, +count);
};

/**
* inserts lines at given position
* @params {number} line - line number to start inserting
* @params {number} count - number of lines to be inserted
* @private
*/
TermBuffer.prototype._insertLine = function(nbr, line) {
	var h = this.getBufferHeight();
	var start = Math.min(h, nbr);
	var end = nbr + 1;
	if(typeof line === 'number') {
		end = nbr + line;
		line = undefined;
	}

	for(i = start; i < end; i++) {
		if(this.height === this.getBufferHeight())
			this._removeLine(this._scrollRegion[1], 1);
		line = this._createLine(line);
		this._buffer.str.splice(start, 0, line.str);
		this._buffer.attr.splice(start, 0, line.attr);
		this.emit('lineinsert', start, line);
		line = undefined;
	}
};

/**
* TODO
* @private
*/
TermBuffer.prototype._applyAttributes = function(line, index, len) {
	var i, prev;

	for(i = index+len; i > 0 && line.attr[i] === undefined; i--);
	prev = line.attr[i];
	for(i = index; i < index+len; i++)
		delete line.attr[i];

	line.attr[index] = this._attributes;
	if(index + len <= this.width)
		line.attr[index + len] = prev;

	this._attributesCow = true;
	return this;
};

/**
* sets cursor to a specific position
* @param {number} x - column of cursor starting at 0
* @param {number} y - row of cursor starting at 0
*/
TermBuffer.prototype.setCursor = function(x, y) {
	var c = this.cursor, line;

	if(typeof x !== 'number')
		x = c.x;
	if(typeof y !== 'number')
		y = c.y;

	if(x < 0)
		x = 0;
	else if(x > this.width)
		x = this.width;

	if(y < 0)
		y = 0;
	else if(y >= this.height)
		y = this.height - 1;

	if(c.x != x || c.y != y || arguments.length === 0) {
		c.x = x;
		c.y = y;

		this.emit('cursormove', x, y);
	}

	return this;
};

/**
* resizes terminal to a specific dimension
* @param {number} width - new width of the terminal
* @param {number} height - new height of the terminal
*/
TermBuffer.prototype.resize = function(width, height) {
	var line;
	this._removeLine(0, Math.max(0, this.height - height));

	this.height = height;
	this.width = width;

	for(var i = 0; i < this._buffer.str.length; i++)
		this.setLine(i, this.getLine(i));

	this.setScrollRegion(0, this.height-1);

	this.emit('resize', width, height);

	this.setCursor();
	return this;
};

/**
* moves cursor relative
* @param {number} x - relative horizontal movement
* @param {number} y - relative vertical movement
*/
TermBuffer.prototype.mvCursor = function(x, y) {
	if(x || y)
		this.setCursor(this.cursor.x + x, this.cursor.y + y);
	return this;
};

/**
* scrolls the scroll area of a buffer
* @param {number} scroll - number of lines to be scrolled (positive: up; negative: down)
*/
TermBuffer.prototype.scroll = function(scroll) {
	var i;
	var count = Math.min(Math.abs(scroll), this._scrollRegion[1] - this._scrollRegion[0]);

	if(scroll > 0) {
		this._removeLine(this._scrollRegion[0], count);
		for(i = 0; i < count; i++) {
			this._insertLine(this._scrollRegion[1] +1  - count);
		}
	}
	else {
		this._removeLine(this._scrollRegion[1] +1 -count, count);
		for(i = 0; i < count; i++) {
			this._insertLine(this._scrollRegion[0]);
		}
	}
};

/**
* returns plain text representation of the buffer
*/
TermBuffer.prototype.toString = function() {
	return this._buffer.str.join('\n');
};

/**
* moves cursor to previous line or scrolls up if at top
*/
TermBuffer.prototype.prevLine = function() {
		if(this.cursor.y == this._scrollRegion[0])
			this.scroll(-1);
		else
			this.mvCursor(0, -1);
		return this;
};

/**
* moves cursor to next line or scrolls down if at bottom
*/
TermBuffer.prototype.nextLine = function() {
		if(this.cursor.y == this._scrollRegion[1])
			this.scroll(1);
		else
			this.mvCursor(0, 1);
		return this;
};

/**
* resets the attributes
*/
TermBuffer.prototype.resetAttribute = function(name) {
	if(name)
		this.setAttribute(name, this._defaultAttr[name]);
	else {
		this._attributesCow = true;
		this._attributes = this._defaultAttr;
	}
	return this;
};

/**
* saves cursor position
*/
TermBuffer.prototype.saveCursor = function() {
	this._savedCursor.x = this.cursor.x;
	this._savedCursor.y = this.cursor.y;
	return this;
};

/**
* restore previously saved cursor position
*/
TermBuffer.prototype.restoreCursor = function() {
	return this.setCursor(this._savedCursor.x, this._savedCursor.y);
};

/**
* truncate characters from buffer at cursor position.
* @param {number} count number of characters to truncate
*/
TermBuffer.prototype.eraseCharacters = function(count) {
	var c = this.cursor, line = this.getLine(c.y);

	line.str = line.str.substr(0, c.x) + myUtil.repeat(' ', count) +
		line.str.substr(c.x + count);
	line.str = line.str.substr(0, this.width);
	this._applyAttributes(line, c.x, count);
	this.setLine(c.y, line);
};

/**
* cleans lines
* @param n can be one of the following:
* <ul>
* 	<li>0 or "after": cleans below and after cursor</li>
* 	<li>1 or "before": cleans above and before cursor</li>
* 	<li>2 or "all": cleans entire screen</li>
* </ul>
*/
TermBuffer.prototype.eraseInDisplay = function(n) {
	var c = this.cursor, i, line, self = this;
	var chLine = function() {
		line = self._createLine();
		self._applyAttributes(line, 0, self.width);
		self.setLine(i, line);
	};
	switch(n || 0) {
		case 'below':
		case 'after':
		case 0:
			n = 0;
			for(i = c.y+1; i < this.height; i++)
				chLine();
			break;
		case 'above':
		case 'before':
		case 1:
			n = 1;
			for(i = 0; i < c.y-1; i++)
				chLine();
			break;
		case 'all':
		case 2:
			for(i = 0; i < this.height; i++)
				chLine();
			return this;
	}
	return this.eraseInLine(n);
};

/**
* cleans one line
* @param n can be one of the following:
* <ul>
* 	<li>0 or "after": cleans from the cursor to the end of the line</li>
* 	<li>1 or "before": cleans from the start of the line to the cursor</li>
* 	<li>2 or "all": cleans entire screen</li>
* </ul>
*/
TermBuffer.prototype.eraseInLine = function(n) {
	var c = this.cursor;
	var line = this.getLine();
	switch(n || 0) {
		case 'after':
		case 0:
			line.str = line.str.substr(0, c.x);
			this._applyAttributes(line, c.x, this.width);
			break;
		case 'before':
		case 1:
			line.str = myUtil.repeat(' ',c.x) + line.str.substr(c.x);
			this._applyAttributes(line, 0, c.x);
			break;
		case 'all':
		case 2:
			l = this._createLine();
			break;
	}
	this.setLine(c.y, line);
	return this;
};

/**
* sets scroll region
*/
TermBuffer.prototype.setScrollRegion = function(n, m) {
	this._scrollRegion[0] = +n;
	this._scrollRegion[1] = +m;
	return this;
};

/**
* switches between default and alternative buffer
* @param alt {boolean} true for switch to alternative buffer, false for default
* buffer
*/
TermBuffer.prototype.switchBuffer = function(alt) {
	var i;
	var active, inactive;
	if(alt) {
		active = this._altBuffer;
		inactive = this._defBuffer;
	}
	else {
		active = this._defBuffer;
		inactive = this._altBuffer;
	}
	if(active === this._buffer)
		return;

	for(i = active.length; i < inactive.length; i++)
		this.emit('lineremove', active.length, this.getLine(i));

	this._buffer = active;

	for(i = 0; i < active.length && i < inactive.length; i++)
		this.emit('linechange', active.length, this.getLine(i));

	for(; i < active.length; i++)
		this.emit('lineinsert', i, this.getLine(i));
	return this;
};

/**
* enables/disable a LED
* @param led {number} LED 0 - 3
* @param value {boolean} sets LED to value
*/
TermBuffer.prototype.setLed = function(led, value) {
	var l = this._leds;
	if (led < 4) { // we only have 4 leds (0,1,2,3)
		this._leds[led] = (value || true);
		this.emit('ledchange', l[0], l[1], l[2], l[3]);
	}
	return this;
};

/**
* gets the internal buffer height. Will be lesser equal than actual height
*/
TermBuffer.prototype.getBufferHeight = function() {
	return this._buffer.str.length;
};

/**
* gets the current value of an LED
* @param led {number} LED 0 - 3
* @returns true if LED is enabled, false otherwise
*/
TermBuffer.prototype.getLed = function(n) {
	return this._leds[n];
};

/**
* gets the line definition
* @param n {number} - line number starting at 0
* @returns line definition
*/
TermBuffer.prototype.getLine = function(n) {
	if(n === undefined)
		n = this.cursor.y;

	if(this._buffer.str[n])
		return {
			str: this._buffer.str[n],
			attr: this._buffer.attr[n]
		};
	else
		return this._createLine();
};

/**
* returns the current value of a given mode
* @param n {string} - mode
*/
TermBuffer.prototype.getMode = function(n) {
	return this._modes[n];
};


/**
* moves Cursor forward or backward a specified amount of tabs
* @param n {number} - number of tabs to move. <0 moves backward, >0 moves
* forward
*/
TermBuffer.prototype.mvTab = function(n) {
	var x = this.cursor.x;
	var tabMax = this._tabs[this._tabs.length - 1] || 0;
	var positive = n > 0;
	n = Math.abs(n);
	while(n !== 0 && x > 0 && x < this.width-1) {
		x += positive ? 1 : -1;
		if(~myUtil.indexOf(this._tabs, x) || (x > tabMax && x % 8 === 0))
			n--;
	}
	this.setCursor(x);
};

/**
* set tab at specified position
* @param pos {number} - position to set a tab at
*/
TermBuffer.prototype.setTab = function(pos) {
	// Set the default to current cursor if no tab position is specified
	if(pos === undefined) {
		pos = this.cursor.x;
	}
	// Only add the tab position if it is not there already
	if (~myUtil.indexOf(this._tabs, pos)) {
		this._tabs.push(pos);
		this._tabs.sort();
	}
};

/**
* remove a tab
* @param pos {number} - position to remove a tab. Do nothing if the tab isn't
* set at this position
*/
TermBuffer.prototype.removeTab = function(pos) {
	var i, tabs = this._tabs;
	for(i = 0; i < tabs.length && tabs[i] !== pos; i++);
	tabs.splice(index,1);
};

/**
* removes a tab at a given index
* @params n {number} - can be one of the following
* <ul>
* 	<li>"current" or 0: searches tab at current position. no tab is at current
* 	position delete the next tab</li>
* 	<li>"all" or 3: deletes all tabs</li>
*/
TermBuffer.prototype.tabClear = function(n) {
	switch(n || 'current') {
		case 'current':
		case 0:
			for(var i = this._tabs.length - 1; i >= 0; i--) {
				if(this._tabs[i] < this.cursor.x) {
					this._tabs.splice(i, 1);
					break;
				}
			}
			break;
		case 'all':
		case 3:
			this._tabs = [];
			break;
	}
};

/**
* sets a given Attribute
*/
TermBuffer.prototype.setAttribute = setterFor("attribute");
/**
* sets a given Mode
*/
TermBuffer.prototype.setMode = setterFor("mode");
/**
* sets a given Meta date
*/
TermBuffer.prototype.setMeta = setterFor("meta");
