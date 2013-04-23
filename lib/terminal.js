var util = require('./util');
var ansi = require('./ansi');
var csi = require('./csi');
var character = require('./character');

//exports.TermDiff = require('./termdiff').TermDiff;

var escapeHandler = {}
escapeHandler[csi.chr] = csi.exec
escapeHandler[ansi.chr] = ansi.exec

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
	'~': '\u00B7',
};


function Terminal(width, height, attr) {
	this.scrollBack = [];
	this.width = width || 80;
	this.height = height || 24;
	this.leds = {1:false,2:false,3:false,4:false}
  // TODO - this doesn't seem to be used
	this.lineAttr = {
		doubletop: false,
		doublebottom: false,
		doublewidth: false
	};
	this.defaultAttr = util.extend({
		fg: 15,
		bg: 0,
		bold: false,
		underline: false,
		blink: false,
		inverse: false,
	}, attr || {});
	this.reset();
}

Terminal.prototype = {
	createChar: function(chr) {
		this.attrCommited = true;
		if(this.mode.graphic)
			chr = graphics[chr] !== undefined ? graphics[chr] : chr;
		return {
			chr: chr === undefined ? ' ' : chr,
			attr: this.attr,
		};
	},
	createLine: function() {
		return {line: [], attr: {}};
	},
	getLine: function() {
		var c = this.cursor;
		return this.buffer[c.y] || (this.buffer[c.y] = this.createLine());
	},
	write: function(data, encoding) {
		// Convert Buffers to strings
		if(typeof data !== 'string')
			data = data.toString(encoding);
		// if there's an unfinished escape sequence
		if(this.escapeBuffer !== null) {
			data = this.escapeBuffer + data;
			this.escapeBuffer = null
		}
		for(var i = 0; i < data.length && i >= 0; i++) {
			if(data[i] === '\x1b') { // ESCAPE
				var len = this.escapeWrite(data.substr(i));
				if(len == 0)
					return true;
				i += len - 1;
			}
			else {
				character.exec(this, data[i]);
			}
		}
		return true;
	},
	escapeWrite: function(data) {
		var cmd = data[1];
		var handler = (escapeHandler[data[1]] || escapeHandler[""])
		var len = 0;
		if(cmd === undefined || (len = handler(this, data)) == 0)
			this.escapeBuffer = data;
		return len;
	},
	inject: function(str) {
		if(this.mode.insert)
			this.insertBlanks(str.length);
		var line = this.getLine();
		line.changed = true;
		var c = this.cursor;
		for(var i = 0; i < str.length; i++) {
			if(c.x >= this.width) {
				if(this.mode.wrap) {
					this.lineFeed();
					this.setCur({x:0});
					line = this.getLine();
					line.soft = true;
					line.changed = true;
				}
				else {
					this.setCur({x:this.width-1})
				}
			}
			line.line[c.x] = this.createChar(str[i]);
			this.mvCur(1,0);
		}
	},
	lineFeed: function() {
		this.mvCur(0,1);
		if(this.mode.crlf)
			this.setCur({x:0});
	},
	mvCur: function(x, y) {
		return this.setCur({
			x: this.cursor.x + parseInt(x),
			y: this.cursor.y + parseInt(y)
		});
	},
	setCur: function(cur) {
		var inbound = 0;
		if(cur.x < 0)
			cur.x = 0;
		else if(cur.x > this.width)
			cur.x = this.width;
		else
			inbound++;

		if(cur.y < 0)
			cur.y = 0;
		else if(cur.y >= this.scrollRegion[1]) {
			this.scroll('down', this.scrollRegion[1] - cur.y + 1);
			cur.y = this.scrollRegion[1] - 1;
		}
		else
			inbound++;

		if(cur.x !== undefined)
			this.cursor.x = cur.x;
		if(cur.y !== undefined)
			this.cursor.y = cur.y;

		return inbound === 2;
	},
	mvTab: function(n) {
		var nx = this.cursor.x;
		var tabMax = this.tabs[this.tabs.length - 1] || 0;
		var positive = n > 0;
		n = Math.abs(n);
		while(n != 0 && nx > 0 && nx < this.width-1) {
			nx += positive ? 1 : -1;
			if(util.indexOf(this.tabs, nx) != -1 || (nx > tabMax && nx % 8 == 0))
				n--;
		}
		this.setCur({x: nx});
	},
	tabSet: function(pos) {
    // Set the default to current cursor if no tab position is specified
		if(pos === undefined) {
      pos = this.cursor.x;
    }
    // Only add the tab position if it is not there already
    if (this.tabs.indexOf(pos) > 0) {
      this.tabs.push(pos);
      this.tabs.sort();
    }
	},
	tabUnset: function(pos) {
    var index = this.tabs.indexOf(pos);
    if (index > 0) {
      this.tabs.splice(index,1);
    }
  },
  // Sets the tabs according the tabs provided
  // Removes previous set tabs if they are not specified
	setTabs: function(tabs) {
    // Save a copy of the oldtabs
    var oldTabs = this.tabs.slice(0);

    for(var i=0 ; i < tabs.length; i++) {
      var pos = oldTabs.indexOf(tabs[i]);
      var found = (pos > 0)
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
    for(var i=0 ; i < oldTabs.length; i++) {
        this.tabUnset(oldTabs[i]);
    }
  },
	tabClear: function(n) {
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
	},
	saveCursor: function() {
		this.savedCursor.x = this.cursor.x;
		this.savedCursor.y = this.cursor.y;
	},
	setSavedCursor: function(cursor) {
		this.savedCursor.x = cursor.x;
		this.savedCursor.y = cursor.y;
	},
	restoreCursor: function() {
		this.setCur(this.savedCursor);
	},
	deleteCharacters: function(n) {
		var line = this.getLine().line;
		line.splice(this.cursor.x, n || 1);
	},
	eraseCharacters: function(n) {
		this.deleteCharacters(n);
		this.insertBlanks(n);
	},
	setScrollRegion: function(n, m) {
		this.scrollRegion[0] = n;
		this.scrollRegion[1] = m;
	},
	eraseInDisplay: function(n) {
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
	},
	eraseInLine: function(n) {
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
	},
	deleteLines: function(n) {
		this.buffer.splice(this.cursor.y, n || 1);
	},
	resetAttr: function() {
		if(arguments.length === 0) {
			this.attr = this.defaultAttr;
			this.attrCommited = true;
		}
		for(var i = 0; i < arguments.length; i++)
			this.chAttr(arguments[i], this.defaultAttr[arguments[i]]);
	},
	chAttr: function(name, value) {
		if(this.attrCommited == true) {
			this.attr = util.extend({}, this.attr);
			delete this.attr.str
		}
		this.attr[name] = value;
		this.attrCommited = false;
	},
	reset: function() {
		this.defaultBuffer = [];
		this.altBuffer = [];
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
		}
		this.attr = this.defaultAttr;
		this.attrCommited = true;
		this.cursor = {x:0,y:0};
		this.savedCursor = {x:0,y:0};
		this.tabs = [];
		this.scrollRegion = [0, this.height];
		this.escapeBuffer = null;
	},
	insertBlanks: function(n) {
		var line = this.getLine();
		line.changed = true;
		var args = Array(parseInt(n));
		args.unshift(this.cursor.x,0);
		Array.prototype.splice.apply(line.line, args);
		line.line.splice(this.width);
	},
	resize: function(w, h) {
		this.buffer.splice(h);
		for(var i = 0; i < this.buffer.length; i++) {
			this.buffer[i].line.splice(w);
			this.buffer[i].changed = true;
		}
		this.width = w;
		this.height = h;
		this.setCur({
			x: this.cursor.x,
			y: this.cursor.y
		});
	},
	insertLines: function(n, pos) {
		if(pos === undefined)
			pos = this.cursor.y;
		if(pos < this.scrollRegion[0] || pos > this.scrollRegion[1])
			return;
		var tail = this.buffer.length - this.scrollRegion[1];
		var args = new Array(n);
		args.unshift(pos, 0);
		Array.prototype.splice.apply(this.buffer, args);
		this.buffer.splice(this.scrollRegion[1], this.buffer.length - this.scrollRegion[1] - tail);
	},
	toString: function(locateCursor) {
		var ret = []
		if(locateCursor) {
			ret.push(Array(this.cursor.x+3).join(' ') + 'v')
		}
		for(var i = 0; i < this.buffer.length; i++) {
			var line = []
			if(locateCursor) {
				line.push((this.buffer[i] && this.buffer[i].changed) ? "*" : " ")
				line.push(i == this.cursor.y ? ">" : " ")
			}
			if(this.buffer[i])
				for(var j = 0; j < this.buffer[i].line.length; j++) {
					line.push(this.buffer[i].line[j] ? (this.buffer[i].line[j].chr || ' ') : ' ');
				}
				while(line[line.length-1] === ' ') line.pop();
			ret.push(line.join(''));
		}
		if(locateCursor)
			ret.push(Array(this.cursor.x+3).join(' ') + '^');
		return ret.join('\n');
	},
	setLed: function(n,value) {
		if(n == 0)
			for(var k in this.leds)
				this.leds[k] = false;
		else
      if (value === undefined) {
        this.leds[n] = true;
      } else {
        this.leds[n] = value;
      }
		//this.metachanged();
		return this;
	},
	setLeds: function(leds) {
    for(var i in leds) {
      this.setLed(i,leds[i]);
    }
  },
	setModes: function(mode) {
    for(var i in mode) {
      this.mode[i] = mode[i];
    }
  },
	setDefaultAttr: function(attrs) {
    for(var i in attrs) {
      this.defaultAttrs[i] = attrs[i];
    }
  },
	setLineAttr: function(attrs) {
    for(var i in attrs) {
      this.lineAttr[i] = attrs[i];
    }
  },
	scroll: function(dir, lines) {
		if(lines === undefined)
			lines = 1;
		// TODO hacky!
		for(var i = 0; i < lines; i++) {
			this.buffer.splice(this.scrollRegion[dir === 'up' ? 0 : 1], 0, this.createLine());
			if(this.height >= this.scrollRegion[dir === 'up' ? 1 : 0])
				this.buffer.splice(this.scrollRegion[dir === 'up' ? 1 : 0], 1);
		}
	},
	eventToKey: function(event) {
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
	},

  // Generates a diff between this.term and OtherTerm
  // if this diff is applied to this.term it results in the same as OtherTerm
  diff: function(otherTerm) {

    var thisBuffer = this.buffer;
    var otherBuffer = otherTerm.buffer;
    var emptyLine = { line: [] };
    var diff = [];

    // Change of Cursor
    if (this.cursor.x !== otherTerm.cursor.x || this.cursor.y !== otherTerm.cursor.y) {
        diff.push({action: 'change', type: 'cursor', data: { x: otherTerm.cursor.x , y: otherTerm.cursor.y}});
    }

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
    for (var key in this.leds) {
      if (this.leds[key] !== otherTerm.leds[key]) {
        ledChange[key] = otherTerm.leds[key]
      }
    }
    if (Object.keys(ledChange).length > 0) { diff.push({action: 'change', type: 'led', data: ledChange}) }

    // Change of Mode
    var modeChange = {};
    for (var key in this.mode) {
      if (this.mode[key] !== otherTerm.mode[key]) {
        modeChange[key] = otherTerm.mode[key]
      }
    }
    if (Object.keys(modeChange).length > 0) { diff.push({action: 'change', type: 'mode', data: modeChange}) }

    // Change of DefaultAttr
    var defaultAttrChange = {};
    for (var key in this.defaultAttr) {
      if (this.defaultAttr[key] !== otherTerm.defaultAttr[key]) {
        defaultAttrChange[key] = otherTerm.defaultAttr[key]
      }
    }
    if (Object.keys(defaultAttrChange).length > 0) { diff.push({action: 'change', type: 'defaultAttr', data: defaultAttrChange}) }

    // Change of (Default)LineAttr
    var lineAttrChange = {};
    for (var key in this.lineAttr) {
      if (this.lineAttr[key] !== otherTerm.lineAttr[key]) {
        lineAtrrChange[key] = otherTerm.lineAttr[key]
      }
    }
    if (Object.keys(lineAttrChange).length > 0) { diff.push({action: 'change' , type: 'lineAttr', data: lineAttrChange}) }

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

    // Go through the common set of lines
    // TODO do we want to sync scrollbuffer
    for(var i=0; i < Math.min(thisBuffer.length, otherBuffer.length) ; i++) {
      var thisLine  = thisBuffer[i]  || emptyLine;
      var otherLine = otherBuffer[i] || emptyLine;

      // TODO We can be smarted by only diffing parts of the line
      // This !== of two lines will always happen, it is not a good test
      if (thisLine !== otherLine) {
        diff.push(util.extend({action: 'replace', type: 'line', lineNumber: i} , otherLine));
      }
    }

    // We have less lines than the other Terminal
    if (thisBuffer.length < otherBuffer.length) {
      // We need to add the extra lines
      for(var i=thisBuffer.length ; i < otherBuffer.length; i++) {
        diff.push(util.extend({action: 'add', type: 'line',  lineNumber: i}, otherBuffer[i]));
      }
    }

    // We have more lines than the other Terminal
    if (thisBuffer.length > otherBuffer.length) {
      // We need to remove the extra lines
      var linesToDelete = thisBuffer.length - otherBuffer.length
      diff.push({action: 'remove', type: 'line' , lineNumber: otherBuffer.length, lines: linesToDelete});
    }

    return (diff);
  },
  apply: function(diff) {

    // Iterate over all entries in the patch
    for(var i in diff) {

      var d = diff[i].data;
      switch(diff[i].type) {
      case 'cursor':
          this.setCur(d);
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
          this.setScrollRegion(d);
          break;
      case 'tab':
          this.setTabs(d);
          break;
      case 'line':
          // type line ( replace, add, remove)
          // insertLines
          // deleteLines
          break;
      }
    }
  }
}

exports.Terminal = Terminal;
