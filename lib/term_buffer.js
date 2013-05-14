var myUtil = require('./util.js');
var PlainRenderer = require('./renderer/plain.js');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var BLANK = ' ';

function setterFor(objName) {
	return function(name, value) {
		if("_"+objName+"sApplied" in this) {
			if(this["_"+objName+"sApplied"] === true)
				this["_"+objName+"s"] = myUtil.extend({}, this["_"+objName+"s"]);
			this["_"+objName+"sApplied"] = false;
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

	this._attributes = this._defaultAttr = myUtil.extend({
		fg: null,
		bg: null,
		bold: false,
		underline: false,
		blink: false,
		inverse: false
	}, attr || {});
	this._attributesApplied = true;

	// Reset all on first use
	this.reset();
}
inherits(TermBuffer, EventEmitter);
module.exports = TermBuffer;

TermBuffer.prototype.reset = function() {
	this._buffer = {
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
	this._cursor = {x:0,y:0};
	this._savedCursor = {x:0,y:0};
	this._tabs = [];
	this._scrollRegion = [0, this.height];
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
	var c = this._cursor;
	
	for(i = 0; i < lines.length; i++) {
		// Carriage Return
		line = lines[i].split('\r');
		lines[i] = line[0];
		for(j = 1; j < line.length && lines[i].length < this.width; j++) {
			lines[i] = line[j] + lines[i].substr(line[j].length);
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
				if(this.width == c.x)
					c.x--;
			}
		}

		// write line
		this._lineInject(lines[i]);

		if(i + 1 !== lines.length) {
			c.y++;
			if(this._modes.crlf)
				c.x = 0;

			if(c.y == this._scrollRegion[1]) {
				c.y--;
				this._removeLine(this._scrollRegion[0]);
			}
		}

	}
	return this.setCursor();
};

TermBuffer.prototype._lineInject = function(content) {
	var c = this._cursor;
	var line = this.getLine();
	if(this._modes.insert) {
		var args = Array(content.length);
		args.unshift(c.x, 0);
		Array.prototype.splice.apply(line.attr, args);
		line.str = line.str.substr(0, c.x) + this._mkBlanks(c.x - line.str.length) +
			content + line.str.substr(c.x);
		line.str = line.str.substr(0, this.width);
	}
	else {
		line.str = line.str.substr(0, c.x) + this._mkBlanks(c.x - line.str.length) +
			content + line.str.substr(c.x+content.length);
	}
	
	this._applyAttributes(line, c.x, content.length);
	this._setLine(line);

	c.x += content.length;
};

TermBuffer.prototype.removeLine = function(count) {
	this._removeLine(this._cursor.y, +count);
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

TermBuffer.prototype._setLine = function(nbr, line) {
	if(typeof nbr === 'object' && line === undefined) {
		line = nbr;
		nbr = this._cursor.y;
	}
	line = this._createLine(line);
	if(this._buffer.str.length <= nbr) {
		this._insertLine(nbr, line);
	}
	else {
		this._buffer.str[nbr] = line.str;
		this._buffer.attr[nbr] = line.attr;
		this.emit('linechange', nbr, line);
	}
};

TermBuffer.prototype.insertLine = function(count) {
	this._insertLine(this._cursor.y, +count);
};

TermBuffer.prototype._insertLine = function(nbr, line) {
	if(typeof line === 'number') {
		while(line--)
			this._insertLine(nbr);
		return;
	}

	line = this._createLine(line);
	if(nbr - 1 > this._buffer.str.length)
		this._insertLine(nbr - 1);
	
	this._buffer.str.splice(nbr, 0, line.str);
	this._buffer.attr.splice(nbr, 0, line.attr);
	this.emit('lineinsert', nbr, line);
};

TermBuffer.prototype._mkBlanks = function(n) {
	return Array(Math.max(n,0)+1).join(BLANK);
};

TermBuffer.prototype._applyAttributes = function(line, index, len) {
	var i, prev;
	len = len || 1;

	for(i = index+len; i > 0 && line.attr[i] === undefined; i--);

	prev = line.attr[i];
	line.attr[index] = this._attributes;
	line.attr[index + len] = prev;
		

	this._attributesApplied = true;
	return this;
};

TermBuffer.prototype.__applyAttributes = function(line, index, len) {
	var i, attr = line.attr;
	len = len || 1;

	for(i = 0; i < len; i++) {
		attr[index+i] = this._attributes;
	}

	this._attributesApplied = true;
	return this;
};

TermBuffer.prototype.setCursor = function(x, y) {
	var cur = this._cursor;

	if(typeof x !== 'number')
		x = cur.x;
	if(typeof y !== 'number')
		y = cur.y;

	if(x < 0)
		x = 0;
	else if(x > this.width)
		x = this.width;

	if(y < 0)
		y = 0;
	else if(y >= this.height)
		y = this.height - 1;
	
	if(cur.x != x || cur.y != y || arguments.length === 0) {
		cur.x = x;
		cur.y = y;
		this.emit('cursormove', x, y);
	}

	return this;
};

TermBuffer.prototype.resize = function(width, height) {
	var line;
	this._removeLine(0, Math.max(0, this.height - height));
	
	for(var i = 0; i < this._buffer.str.length; i++) {
		line = this.getLine(i);
		line.str = line.str.substr(0,width),
		this._setLine(i, line);
	}

	this.height = height;
	this.width = width;

	this.emit('resize', width, height);

	this.setCursor();
	return this;
};

TermBuffer.prototype.mvCursor = function(x, y) {
	if(x || y)
		this.setCursor(this._cursor.x + x, this._cursor.y + y);
	return this;
};

TermBuffer.prototype.scroll = function(scroll) {
	// positive: down; negative: up
	var i;
	var count = Math.min(Math.abs(scroll), this._scrollRegion[1] - this._scrollRegion[0]);
	
	if(scroll > 0) {
		this._removeLine(this._scrollRegion[0], count);
		for(i = 0; i < count; i++) {
			this._insertLine(this._scrollRegion[1] - count);
		}
	}
	else {
		this._removeLine(this._scrollRegion[1]-count, count);
		for(i = 0; i < count; i++) {
			this._insertLine(this._scrollRegion[0]);
		}
	}
};

TermBuffer.prototype.toString = function() {
	return this._buffer.str.join('\n');
};

TermBuffer.prototype.nextLine = function() {
		if(this._cursor.y == this._scrollRegion[1])
			this.scroll('up');
		else
			this.mvCursor(0, 1);
		return this;
};

TermBuffer.prototype.resetAttribute = function(name) {
	if(name)
		this.setAttribute(name, this._defaultAttr[name]);
	else
		for(name in this._attributes)
			this.setAttribute(name, this._defaultAttr[name]);
	return this;
};

TermBuffer.prototype.saveCursor = function() {
	this._savedCursor.x = this._cursor.x;
	this._savedCursor.y = this._cursor.y;
	return this;
};

TermBuffer.prototype.restoreCursor = function() {
	return this.setCursor(this._savedCursor.x, this._savedCursor.y);
};

TermBuffer.prototype.eraseInDisplay = function(n) {
	var c = this._cursor;
	var i;
	switch(n || 0) {
		case 'below':
		case 0:
			n = 0;
			this._removeLine(c.y+1, this.height - c.y - 1);
			break;
		case 'above':
		case 1:
			n = 1;
			for(i = 0; i < this._cursor.y-1; i++)
				this._setLine(i);
			break;
		case 'all':
		case 2:
			this._removeLine(0, this.height);
			return this;
	}
	return this.eraseInLine(n);
};

TermBuffer.prototype.eraseInLine = function(n) {
	var c = this._cursor;
	var line = this.getLine();
	switch(n || 0) {
		case 'toRight':
		case 0:
			line.str = line.str.substr(0, c.x);
			// TODO change attr accordingly
			break;
		case 'toLeft':
		case 1:
			line.str = this._mkBlanks(c.x) + line.str.substr(c.x);
			// TODO change attr accordingly
			break;
		case 'all':
		case 2:
			l = this._createLine();
			break;
	}
	this._setLine(c.y, line);
	return this;
};

TermBuffer.prototype.setScrollRegion = function(n, m) {
	this._scrollRegion[0] = +n;
	this._scrollRegion[1] = +m;
	return this;
};

TermBuffer.prototype.getLine = function(n) {
	if(n === undefined)
		n = this._cursor.y;

	if(this._buffer.str[n])
		return {
			str: this._buffer.str[n],
			attr: this._buffer.attr[n]
		};
	else
		return this._createLine();
};

TermBuffer.prototype.setAttribute = setterFor("attribute");
TermBuffer.prototype.setMode = setterFor("mode");
