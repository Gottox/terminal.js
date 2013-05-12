var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var util = require('./util');
var PlainRenderer = require('./renderer/plain.js');

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

function TermBuffer(width, height, attr) {
	this.constructor.super_.call(this);
	this.scrollBack = [];
	this.width = width || 80;
	this.height = height || 24;
	this.lineAttr = {
		doubletop: false,
		doublebottom: false,
		doublewidth: false
	};

	this.defaultAttr = util.extend({
		fg: null,
		bg: null,
		bold: false,
		underline: false,
		blink: false,
		inverse: false
	}, attr || {});

	// Reset all on first use
	this.reset();
}
inherits(TermBuffer, EventEmitter);
module.exports = TermBuffer;

TermBuffer.prototype.reset = function() {
	this.defaultBuffer = [];
	this.altBuffer = [];
	this.oldChunk = null;
	this.buffer = this.defaultBuffer.slice(0);
	this.mode = {
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
	this.attr = this.defaultAttr;
	this.attrCommited = true;
	this.cursor = {x:0,y:0};
	this.savedCursor = {x:0,y:0};
	this.tabs = [];
	this.scrollRegion = [0, this.height];
	this.leds = [!!0,!!0,!!0,!!0];
};

TermBuffer.prototype.createChar = function(chr) {
	this.attrCommited = true;
	if(this.mode.graphic)
		chr = graphics[chr] !== undefined ? graphics[chr] : chr;
	return {
		chr: chr === undefined ? ' ' : chr,
		attr: this.attr
	};
};

// TODO - this should read the (Default)LineAttr
TermBuffer.prototype.createLine = function() {
	return {line: [], attr: {}};
};

TermBuffer.prototype.getLine = function() {
	var c = this.cursor;
	return this.buffer[c.y] || (this.buffer[c.y] = this.createLine());
};

TermBuffer.prototype.inject = function(str, len) {
	if(len === undefined)
		len = str.length;
	if(this.mode.insert)
		this.insertBlanks(len);
	var line = this.getLine();
	line.changed = true;
	var c = this.cursor;
	for(var i = 0; i < len; i++) {
		if(c.x >= this.width || str[i] === '\n') {
			if(this.mode.wrap || str[i] === '\n') {
				this.emit("linechange", c.y, line);
				this.lineFeed();
				this.setCur({x:0});
				line = this.getLine();
				line.soft = str[i] !== '\n';
				line.changed = true;
			}
			else {
				this.setCur({x:this.width-1});
			}
		}
		if(str[i] !== '\n') {
			line.line[c.x] = this.createChar(str[i]);
			this.mvCur(1,0);
		}
	}
	this.emit("linechange", c.y, line);
};

TermBuffer.prototype.lineFeed = function() {
	if(!this.mvCur(0,1))
		this.scroll('down');
	if(this.mode.crlf)
		this.setCur({x:0});
};

TermBuffer.prototype.mvCur = function(x, y) {
	return this.setCur({
		x: this.cursor.x + parseInt(x, 10),
		y: this.cursor.y + parseInt(y, 10)
	});
};

TermBuffer.prototype.setCur = function(cur) {
	var inbound = 0;
	if(cur.x < 0)
		cur.x = 0;
	else if(cur.x > this.width)
		cur.x = this.width;
	else
		inbound++;

	if(cur.y < 0)
		cur.y = 0;
	else if(cur.y >= this.height)
		cur.y = this.height - 1;
	else
		inbound++;

	if(cur.x !== undefined)
		this.cursor.x = cur.x;
	if(cur.y !== undefined)
		this.cursor.y = cur.y;

	return inbound === 2;
};

TermBuffer.prototype.mvTab = function(n) {
	var nx = this.cursor.x;
	var tabMax = this.tabs[this.tabs.length - 1] || 0;
	var positive = n > 0;
	n = Math.abs(n);
	while(n !== 0 && nx > 0 && nx < this.width-1) {
		nx += positive ? 1 : -1;
		if(util.indexOf(this.tabs, nx) != -1 || (nx > tabMax && nx % 8 === 0))
			n--;
	}
	this.setCur({x: nx});
};

TermBuffer.prototype.tabSet = function(pos) {
	// Set the default to current cursor if no tab position is specified
	if(pos === undefined) {
		pos = this.cursor.x;
	}
	// Only add the tab position if it is not there already
	if (this.tabs.indexOf(pos) > 0) {
		this.tabs.push(pos);
		this.tabs.sort();
	}
};

TermBuffer.prototype.tabUnset = function(pos) {
	var index = this.tabs.indexOf(pos);
	if (index > 0) {
		this.tabs.splice(index,1);
	}
};

TermBuffer.prototype.tabClear = function(n) {
	switch(n || 'current') {
		case 'current':
		case 0:
			for(var i = this.tabs.length - 1; i >= 0; i--) {
				if(this.tabs[i] < this.cursor.x) {
					this.tabs.splice(i, 1);
					break;
				}
			}
			break;
		case 'all':
		case 3:
			this.tabs = [];
			break;
	}
};

TermBuffer.prototype.saveCursor = function() {
	this.savedCursor.x = this.cursor.x;
	this.savedCursor.y = this.cursor.y;
};

TermBuffer.prototype.restoreCursor = function() {
	this.setCur(this.savedCursor);
};

TermBuffer.prototype.deleteCharacters = function(n) {
	var line = this.getLine().line;
	line.splice(this.cursor.x, n || 1);
};

TermBuffer.prototype.eraseCharacters = function(n) {
	this.deleteCharacters(n);
	this.insertBlanks(n);
};

TermBuffer.prototype.setScrollRegion = function(n, m) {
	this.scrollRegion[0] = n;
	this.scrollRegion[1] = m;
};

TermBuffer.prototype.eraseInDisplay = function(n) {
	switch(n || 0) {
		case 0:
			this.buffer.splice(this.cursor.y);
			break;
		case 1:
			var args = [0, this.cursor.y-1, Array(this.cursor.y-1)];
			Array.prototype.splice.apply(this.buffer, args);
			break;
		case 2:
			this.buffer.splice(0);
			return;
	}
	return this.eraseInLine(n);
};

TermBuffer.prototype.eraseInLine = function(n) {
	var line = this.getLine();
	line.changed = true;
	switch(n || 0) {
		case 0:
			line.line.splice(this.cursor.x);
			break;
		case 1:
			var args = new Array(this.cursor.x+1);
			args.unshift(0, this.cursor.x+1);
			Array.prototype.splice.apply(line.line, args);
			while(line.line[line.line.length - 1] !== undefined)
				line.line.pop();
			break;
		case 2:
			line.line.splice(0);
			break;
	}
	return this;
};

TermBuffer.prototype.resetAttr = function() {
	if(arguments.length === 0) {
		this.attr = this.defaultAttr;
		this.attrCommited = true;
	}
	for(var i = 0; i < arguments.length; i++)
		this.chAttr(arguments[i], this.defaultAttr[arguments[i]]);
};

TermBuffer.prototype.chAttr = function(name, value) {
	if(this.attrCommited === true) {
		this.attr = util.extend({}, this.attr);
		delete this.attr.str;
	}
	this.attr[name] = value;
	this.attrCommited = false;
};

TermBuffer.prototype.insertBlanks = function(n) {
	var line = this.getLine();
	line.changed = true;
	var args = Array(parseInt(n, 10));
	args.unshift(this.cursor.x,0);
	Array.prototype.splice.apply(line.line, args);
	line.line.splice(this.width);
	this.emit('linechange', this.cursor.y, line);
};

TermBuffer.prototype.resize = function(w, h) {
	var n;
	if (h < this.height) {
		// Remove the buffer part above the size
		n = this.buffer.splice(h).length;
		while(n--)
			this.emit('lineremove', h);
	}
	else {
		// Add empty lines
		this.insertLines((h - this.height),0);
	}
	for(var i = 0; i < this.buffer.length; i++) {
		if (this.buffer[i]) {
			if(this.buffer[i].line.splice(w).length !== 0)
				this.emit('linechange', i, this.getLine(i));
			this.buffer[i].changed = true;
		}
	} 

	this.width = w;
	this.height = h;

	this.setScrollRegion(0, h);

	// If the cursor is outside boundaries, it will be corrected
	this.setCur({
		x: this.cursor.x,
		y: this.cursor.y
	});
};

TermBuffer.prototype.eventToKey = function(event) {
	var kpd = this.mode.appKeypad;
	switch(event.which) {
		case 38: // up
			return kpd ? "\x1bOA" : "\x1b[A";
		case 40: // down
			return kpd ? "\x1bOB" : "\x1b[B";
		case 39: // right
			return kpd ? "\x1bOC" : "\x1b[C";
		case 37: // left
			return kpd ? "\x1bOD" : "\x1b[D";
		case 8:
			return "\x08";
		case 9:
			return "\t";
		default:
			return String.fromCharCode(event.which);
	}
};

TermBuffer.prototype.insertLines = function(n, pos) {
	if(pos === undefined)
		pos = this.cursor.y;
	if(pos < this.scrollRegion[0] || pos > this.scrollRegion[1])
		return;
	var tail = this.buffer.length - this.scrollRegion[1];
	var args = new Array(n);
	args.unshift(pos, 0);
	Array.prototype.splice.apply(this.buffer, args);
	this.buffer.splice(this.scrollRegion[1], this.buffer.length - this.scrollRegion[1] - tail);
	// TODO emit lineinsert and lineremove
};

TermBuffer.prototype.toString = function(locateCursor) {
	return new PlainRenderer(this, { locateCursor: locateCursor }).toString();
};

TermBuffer.prototype.setLed = function(n,value) {
	if(n === 0)
		this.leds = [!!0,!!0,!!0,!!0];
	else
	if (value === undefined) {
		this.leds[n] = true;
	} else {
		this.leds[n] = value;
	}
	return this;
};

TermBuffer.prototype.deleteLines = function(n, row) {
	if (row === undefined)
		row = this.cursor.y;
	n = n || 1;
	this.buffer.splice(row, n);
	for(var i = 0; i < n; i++)
		this.emit('lineremove', row);
};

// TODO: From here: move to new TermDiff class -------------------------

// Sets the tabs according the tabs provided
// Removes previous set tabs if they are not specified
TermBuffer.prototype.setTabs = function(tabs) {
	// Save a copy of the oldtabs
	var oldTabs = this.tabs.slice(0);
	var i;

	for(i=0 ; i < tabs.length; i++) {
		var pos = oldTabs.indexOf(tabs[i]);
		var found = (pos > 0);
		if (found) {
			// Remove it from the OldTabs to handle
			oldTabs.splice(pos,1);
			// Remove it from the tabs to handle
			tabs.splice(i,1);
		} else {
			// Set the tab
			this.tabSet(tabs[i]);
		}
	}

	// Now remove the remainder Oldtabs
	for(i=0; i < oldTabs.length; i++) {
		this.tabUnset(oldTabs[i]);
	}
};


TermBuffer.prototype.setSavedCursor = function(cursor) {
	this.savedCursor.x = cursor.x;
	this.savedCursor.y = cursor.y;
};


TermBuffer.prototype.addLine = function(line, row) {
	// Simple deep object copy
	var newLine =  JSON.parse(JSON.stringify(line));
	this.buffer.splice(row,0,newLine);
};

TermBuffer.prototype.replaceLine = function(line, row) {
	// TODO We could be more intelligent and just replace characters
	this.deleteLines(1,row);
	this.addLine(line, row);
};

TermBuffer.prototype.setLeds = function(leds) {
	for(var i in leds) {
		this.setLed(i,leds[i]);
	}
};

TermBuffer.prototype.setModes = function(mode) {
	for(var i in mode) {
		this.mode[i] = mode[i];
	}
},

TermBuffer.prototype.setDefaultAttr = function(attrs) {
	for(var i in attrs) {
		this.defaultAttrs[i] = attrs[i];
	}
};

TermBuffer.prototype.setLineAttr = function(attrs) {
	for(var i in attrs) {
		this.lineAttr[i] = attrs[i];
	}
};

TermBuffer.prototype.scroll = function(dir, lines) {
	if(lines === undefined)
		lines = 1;
	// TODO hacky!
	for(var i = 0; i < lines; i++) {
		this.buffer.splice(this.scrollRegion[dir === 'up' ? 0 : 1], 0, this.createLine());
		if(this.height >= this.scrollRegion[dir === 'up' ? 1 : 0])
			this.buffer.splice(this.scrollRegion[dir === 'up' ? 1 : 0], 1);
	}
};

TermBuffer.prototype.write = function(write, encoding) {
	if(this._writer === undefined) {
		console.warn("TermBuffer.write is deprecated. Use TermWriter.write insted!");
		this._writer = new (require("./term_writer.js"))(this);
	}
	return this._writer.write.apply(this._writer, arguments);
};

// Generates a diff between this.term and OtherTerm
// if this diff is applied to this.term it results in the same as OtherTerm
TermBuffer.prototype.diff = function(otherTerm) {

	var thisBuffer = this.buffer;
	var otherBuffer = otherTerm.buffer;
	var emptyLine = { line: [] };
	var diff = [];
	var key, i, otherLine;


	// Change of saveCursor
	if (this.savedCursor.x !== otherTerm.savedCursor.x || this.savedCursor.y !== otherTerm.savedCursor.y) {
		diff.push({action: 'change', type: 'savedCursor', data: { x: otherTerm.savedCursor.x , y: otherTerm.savedCursor.y}});
	}

	// Change in size
	if (this.width !== otherTerm.width || this.height !== otherTerm.height) {
		diff.push({action: 'change' , type: 'size', data: { width: otherTerm.width , height: otherTerm.height}});
	}

	// Change of Leds
	var ledChange = {};
	for (key in this.leds) {
		if (this.leds[key] !== otherTerm.leds[key]) {
			ledChange[key] = otherTerm.leds[key];
		}
	}
	if (Object.keys(ledChange).length > 0) { diff.push({action: 'change', type: 'led', data: ledChange}); }

	// Change of Mode
	var modeChange = {};
	for (key in this.mode) {
		if (this.mode[key] !== otherTerm.mode[key]) {
			modeChange[key] = otherTerm.mode[key];
		}
	}
	if (Object.keys(modeChange).length > 0) { diff.push({action: 'change', type: 'mode', data: modeChange}); }

	// Change of DefaultAttr
	var defaultAttrChange = {};
	for (key in this.defaultAttr) {
		if (this.defaultAttr[key] !== otherTerm.defaultAttr[key]) {
			defaultAttrChange[key] = otherTerm.defaultAttr[key];
		}
	}
	if (Object.keys(defaultAttrChange).length > 0) { diff.push({action: 'change', type: 'defaultAttr', data: defaultAttrChange}); }

	// Change of (Default)LineAttr
	var lineAttrChange = {};
	for (key in this.lineAttr) {
		if (this.lineAttr[key] !== otherTerm.lineAttr[key]) {
			lineAtrrChange[key] = otherTerm.lineAttr[key];
		}
	}
	if (Object.keys(lineAttrChange).length > 0) { diff.push({action: 'change' , type: 'lineAttr', data: lineAttrChange}); }

	// Change of scrollRegion
	if (this.scrollRegion[0] !== otherTerm.scrollRegion[0] || this.scrollRegion[1] !== otherTerm.scrollRegion[1]) {
		diff.push({action: 'change' , type: 'scrollRegion', data: [ otherTerm.scrollRegion[0] , otherTerm.scrollRegion[1] ]} );
	}

	// Change of Tabs
	if (this.tabs.join(',') !== otherTerm.tabs.join(',')) {
		diff.push({action: 'change' , type: 'tabs', data: otherTerm.tabs.slice(0)});
	}

	// TODO Detect Change of DefaultBuffer
	// TODO - don't extend a line, clone the array of the line

	// We have more lines than the other TermBuffer
	if (thisBuffer.length > otherBuffer.length) {
		// We need to remove the extra lines
		var linesToDelete = thisBuffer.length - otherBuffer.length;
		diff.push({action: 'remove', type: 'line' , data: { lineNumber: otherBuffer.length , lines: linesToDelete}});
	}

	// Go through the common set of lines
	// TODO sync the scrollbuffer
	for(i=0; i < Math.min(thisBuffer.length, otherBuffer.length) ; i++) {
		var thisLine  = thisBuffer[i]  || emptyLine;
		otherLine = otherBuffer[i] || emptyLine;

		// TODO We can be smarter by only diffing parts of the line
		// This !== of two lines will always happen, it is not a good test
		var isDifferent = (JSON.stringify(thisLine) !== JSON.stringify(otherLine));
		if (isDifferent) {
			diff.push({action: 'replace', type: 'line', data: {lineNumber: i , line: otherLine}});
		}
	}

	// We have less lines than the other TermBuffer
	if (thisBuffer.length < otherBuffer.length) {
		// We need to add the extra lines
		for(i = thisBuffer.length ; i < otherBuffer.length; i++) {
			otherLine = otherBuffer[i] || emptyLine;
			diff.push({action: 'add', type: 'line',  data: {lineNumber: i, line: otherLine}});
		}
	}

	// We need to do this as the last patch (to make sure all lines have been created)
	// Change of Cursor
	if (this.cursor.x !== otherTerm.cursor.x || this.cursor.y !== otherTerm.cursor.y) {
		diff.push({action: 'change', type: 'cursor', data: {
			from: { x: this.cursor.x , y: this.cursor.y},
			to: { x: otherTerm.cursor.x , y: otherTerm.cursor.y}
		}});
	}

	return (diff);
};

TermBuffer.prototype.apply = function(diff) {

	// Iterate over all entries in the patch
	for(var i in diff) {

		var d = diff[i].data;
		switch(diff[i].type) {
			case 'cursor':
				this.setCur(d.to);
				break;
			case 'savedCursor':
				this.setSavedCursor(d);
				break;
			case 'size':
				this.resize(d.width, d.height);
				break;
			case 'led':
				this.setLeds(d);
				break;
			case 'mode':
				this.setModes(d);
				break;
			case 'defaultAttr':
				this.setDefaultAttr(d);
				break;
			case 'lineAttr':
				this.setLineAttr(d);
				break;
			case 'scrollRegion':
				this.setScrollRegion(d[0], d[1]);
				break;
			case 'tab':
				this.setTabs(d);
				break;
			case 'line':
				switch (diff[i].action) {
					case 'replace':
						this.replaceLine(d.line, d.lineNumber);
						break;
					case 'add':
						this.addLine(d.line, d.lineNumber);
						break;
					case 'remove':
						this.deleteLines(d.lines, d.lineNumber);
						break;
				}
				break;
		}
	}
};

