var myUtil = require('./util.js');
var PlainRenderer = require('./renderer/plain.js');
var inherits = require('util').inherits;

var BLANK = ' ';

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

function TermBuffer(width, height, attr) {
	TermBuffer.super_.call(this);
	this.height = height || 24;
	this.width = width || 80;

	this._defaultAttr = myUtil.extend({
		fg: null,
		bg: null,
		bold: false,
		underline: false,
		blink: false,
		inverse: false
	}, attr || {});
	this._attributesCow = true;

	// Reset all on first use
	this.reset();
}
inherits(TermBuffer, require('events').EventEmitter);
module.exports = TermBuffer;

TermBuffer.prototype.reset = function() {
	this._buffer = this._defBuffer = {
		str: [], attr: []
	};
	this._altBuffer = {
		str: [], attr: []
	};
	this._modes = {
		cursor: true,
		appKeypad: false,
		wrap: true,
		insert: false,
		crlf: false,
		mousebtn: false,
		mousemtn: false,
		reverse: false,
		graphic: false
	};
	this.resetAttribute();
	this.cursor = {x:0,y:0};
	this._savedCursor = {x:0,y:0};
	this._tabs = [];
	this._scrollRegion = [0, this.height-1];
	this._leds = [!!0,!!0,!!0,!!0];
	
	this._lineAttr = {
		doubletop: false,
		doublebottom: false,
		doublewidth: false
	};

};

TermBuffer.prototype._createLine = function(line) {
	if(line === undefined || typeof line === 'string')
		line = { str: line || "", attr: {0: this._defaultAttr} };
	else if(!line || typeof line.str !== 'string' || typeof line.attr !== 'object')
		throw new Error('line objects must contain attr and str' + line);

	for(var i in line.attr) {
		if(+i > line.str.length || line.attr[i] === undefined)
			delete line.attr[i];
	}
	return line;
};

TermBuffer.prototype.inject = function(str) {
	var i, j, line;
	var lines = str.split('\n');
	var c = this.cursor, cx;
	
	for(i = 0; i < lines.length; i++) {
		cx = null;
		// Carriage Return
		line = lines[i].split('\r');
		lines[i] = line[0];
		for(j = 1; j < line.length && lines[i].length < this.width; j++) {
			lines[i] = line[j] + lines[i].substr(line[j].length);
			cx = line[j].length;
		}

		// Handle long lines
		if(lines[i].length > this.width - c.x && lines[i].length > 0) {
			if(this._modes.wrap)
				lines.splice(i, 1,
					lines[i].substr(0, this.width - c.x),
					lines[i].substr(this.width - c.x)
				);
			else {
				lines[i] = lines[i].substr(0, this.width - c.x - 1) +
					lines[i].substr(-1);
				if(c.x >= this.width)
					c.x = this.width - 1;
			}
		}

		// write line
		this._lineInject(lines[i]);

		if(i + 1 !== lines.length) {
			c.y++;
			if(this._modes.crlf)
				c.x = 0;

			if(c.y > this._scrollRegion[1]) {
				c.y--;
				this._removeLine(this._scrollRegion[0]);
			}
		}
		if(cx !== null)
			c.x = cx;

	}
	return this.setCursor();
};

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

TermBuffer.prototype._graphConvert = function(content) {
	if(this._modes.graphic) {
		var orig = content;
		var graph = [];
		for(i = 0; i < content.length; i++) {
			graph.push(graphics[content[i]]);
		}
		return graph.join('');
	} else  {
		return content;
	}
};

TermBuffer.prototype._lineInject = function(content) {
	var c = this.cursor;
	var line = this.getLine();
	if(this._modes.insert) {
		var args = Array(content.length);
		args.unshift(c.x, 0);
		Array.prototype.splice.apply(line.attr, args);
		line.str = line.str.substr(0, c.x) + myUtil.repeat(' ',c.x - line.str.length) +
			this._graphConvert(content) + line.str.substr(c.x);
		line.str = line.str.substr(0, this.width);
	}
	else {
		line.str = line.str.substr(0, c.x) + myUtil.repeat(' ',c.x - line.str.length) +
			this._graphConvert(content) + line.str.substr(c.x+content.length);
	}
	
	this._applyAttributes(line, c.x, content.length);
	this.setLine(line);

	c.x += content.length;
};

TermBuffer.prototype.removeChar = function(count) {
	var c = this.cursor, line = this.getLine(c.y);
	line.str = line.str.substr(0, c.x) + line.str.substr(c.x+count);
	Array.prototype.splice.call(line.attr, c.y, count);
	this.setLine(c.y, line);
};

TermBuffer.prototype.insertBlank = function(count) {
	var c = this.cursor, line = this.getLine(c.y);
	line.str = line.str.substr(0, c.x) +
		myUtil.repeat(' ', count) + line.str.substr(c.x+count);
	Array.prototype.splice.call(line.attr, c.y, 0, Array(count));
	this.setLine(c.y, line);
};

TermBuffer.prototype.removeLine = function(count) {
	this._removeLine(this.cursor.y, +count);
};

TermBuffer.prototype._removeLine = function(line, count) {
	var i;
	if(count === undefined)
		count = 1;
	count = this._buffer.str.splice(line, count).length;
	this._buffer.attr.splice(line, count);
	for(i = 0; i < count; i++)
		this.emit('lineremove', line);
	return count;
};

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
			attr[this.width] = attr[line.str.length];
		this._buffer.str[nbr] = line.str.substr(0, this.width);
		this._buffer.attr[nbr] = line.attr;
		this.emit('linechange', nbr, line);
	}
};

TermBuffer.prototype.insertLine = function(count) {
	this._insertLine(this.cursor.y, +count);
};

TermBuffer.prototype._insertLine = function(nbr, line) {
	var h = this.getBufferHeight();
	var start = Math.min(h, nbr);
	var end = nbr + 1;
	if(typeof line === 'number') {
		end = nbr + line;
		line = undefined;
	}

	for(i = start; i < end; i++) {
		if(this.height == this.getBufferHeight())
			this._removeLine(0, end - i);
		line = this._createLine(line);
		this._buffer.str.splice(start, 0, line.str);
		this._buffer.attr.splice(start, 0, line.attr);
		this.emit('lineinsert', start, line);
		line = undefined;
	}
};

TermBuffer.prototype._applyAttributes = function(line, index, len) {
	var i, prev;

	for(i = index+len; i > 0 && line.attr[i] === undefined; i--);
	prev = line.attr[i];
	for(i = index; i < index+len; i++)
		delete line.attr[i];

	line.attr[index] = this._attributes;
	if(index + len < this.width)
		line.attr[index + len] = prev;

	this._attributesCow = true;
	return this;
};

TermBuffer.prototype.setCursor = function(x, y) {
	var c = this.cursor, oldX, oldY, line;

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
		oldX = c.x;
		oldY = c.y;
		c.x = x;
		c.y = y;

		this.emit('cursormove', x, y);
	}

	return this;
};

TermBuffer.prototype.resize = function(width, height) {
	var line;
	this._removeLine(0, Math.max(0, this.height - height));
	
	this.height = height;
	this.width = width;

	for(var i = 0; i < this._buffer.str.length; i++)
		this.setLine(i, this.getLine(i));

	this.emit('resize', width, height);

	this.setCursor();
	return this;
};

TermBuffer.prototype.mvCursor = function(x, y) {
	if(x || y)
		this.setCursor(this.cursor.x + x, this.cursor.y + y);
	return this;
};

TermBuffer.prototype.scroll = function(scroll) {
	// positive: down; negative: up
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

TermBuffer.prototype.toString = function() {
	return this._buffer.str.join('\n');
};

TermBuffer.prototype.nextLine = function() {
		if(this.cursor.y == this._scrollRegion[1])
			this.scroll('up');
		else
			this.mvCursor(0, 1);
		return this;
};

TermBuffer.prototype.resetAttribute = function(name) {
	if(name)
		this.setAttribute(name, this._defaultAttr[name]);
	else {
		this._attributesCow = true;
		this._attributes = this._defaultAttr;
	}
	return this;
};

TermBuffer.prototype.saveCursor = function() {
	this._savedCursor.x = this.cursor.x;
	this._savedCursor.y = this.cursor.y;
	return this;
};

TermBuffer.prototype.restoreCursor = function() {
	return this.setCursor(this._savedCursor.x, this._savedCursor.y);
};

TermBuffer.prototype.eraseCharacters = function(count) {
	var c = this.cursor, line = this.getLine(c.y);

	line.str = line.str.substr(0, c.x) + myUtil.repeat(' ', count) +
		line.str.substr(c.x + count);
	line.str = line.str.substr(0, this.width);
	this._applyAttributes(line, c.x, count);
	this.setLine(c.y, line);
};

TermBuffer.prototype.eraseInDisplay = function(n) {
	var c = this.cursor, i, line, self = this;
	var chLine = function() {
		line = self._createLine();
		self._applyAttributes(line, 0, self.width);
		self.setLine(i, line);
	};
	switch(n || 0) {
		case 'below':
		case 0:
			n = 0;
			for(i = c.y+1; i < this.height; i++)
				chLine();
			break;
		case 'above':
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

TermBuffer.prototype.eraseInLine = function(n) {
	var c = this.cursor;
	var line = this.getLine();
	switch(n || 0) {
		case 'toRight':
		case 0:
			line.str = line.str.substr(0, c.x);
			this._applyAttributes(line, c.x, this.width);
			break;
		case 'toLeft':
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

TermBuffer.prototype.setScrollRegion = function(n, m) {
	this._scrollRegion[0] = +n;
	this._scrollRegion[1] = +m;
	return this;
};

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

TermBuffer.prototype.setLed = function(led, value) {
	var l = this._leds;
	if (led < 4) { // we only have 4 leds (0,1,2,3)
		this._leds[led] = (value || true);
		this.emit('ledchange', l[0], l[1], l[2], l[3]);
	}
	return this;
};

TermBuffer.prototype.getBufferHeight = function() {
	return this._buffer.str.length;
};

TermBuffer.prototype.getLed = function(n) {
	return this._leds[n];
};

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

TermBuffer.prototype.getMode = function(n) {
	return this._modes[n];
};

TermBuffer.prototype.setAttribute = setterFor("attribute");
TermBuffer.prototype.setMode = setterFor("mode");
