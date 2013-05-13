var myUtil = require('./util.js');
var PlainRenderer = require('./renderer/plain.js');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var BLANK = ' ';

function setterFor(objName) {
	return function(name, value) {
		var obj = this["_"+objName+"s"];
		if("_"+objName+"sApplied" in this) {
			if("_"+objName+"sApplied" === true)
				this["_"+objName+"sApplied"] = myUtil.extend({}, this["_"+objName+"sApplied"]);
			this["_"+objName+"sApplied"] = false;
		}

		if(!(name in obj))
			throw new Error("Unknown "+objName+" `"+name+"`");
		this.emit(objName+"change", name, value, obj[name]);
		obj[name] = value;
	};
}

function TermBuffer(width, height, attr) {
	this.constructor.super_.call(this);
	this.height = height || 24;
	this.width = width || 80;
	this._defaultAttr = myUtil.extend({}, attr);

	this._defaultAttr = myUtil.extend({
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
	this._attributes = this.defaultAttr;
	this._attributesApplied = false;
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


TermBuffer.prototype.inject = function(str) {
	var i, j, line;
	var lines = str.split('\n');
	var c = this._cursor;
	
	for(i = 0; i < lines.length; i++) {
		// Carriage Return
		line = lines[i].split('\r');
		lines[i] = line[0];
		for(j = 1; j < line.length && lines[i].length < this.width; j++) {
			lines[i] = line[j] + lines[i].substr(line.length);
		}


		if(c.x + lines[i].length > this.width) {
			if(this._modes.wrap)
				lines.splice(i, 1,
					lines[i].substr(0, this.width),
					lines[i].substr(this.width)
				);
			else
				lines[i] = lines[i].substr(0, this.width - 1) +
					lines[i].substr(-1);
		}

		this._lineInject(lines[i]);

		if(i + 1 !== lines.length) {
			c.y++;
			if(this.crlf)
				c.x = 0;
		}

		if(c.y == this._scrollRegion[1]) {
			c.y--;
			this._removeLine(this._scrollRegion[0]);
		}
	}
	return this;
};

TermBuffer.prototype._lineInject = function(content) {
	var c = this._cursor;
	var str = this._buffer.str[c.y] || "";
	var attr = this._buffer.attr[c.y] || [];
	if(this._modes.insert) {
		attr.splice(c.x, 0, content.length);
		attr.splice(this.width);
		str = str.substr(0, c.x) + this._mkBlanks(c.x - str.length) +
			content + str.substr(c.x);
	}
	else {
		str = str.substr(0, c.x) + this._mkBlanks(c.x - str.length) +
			content + str.substr(c.x+content.length);
	}
	
	while(this._buffer.str.length < c.y - 1) {
		this._buffer.str.push("");
		this._buffer.attr.push([]);
	}
	this._buffer.str[c.y] = str;
	this._buffer.attr[c.y] = attr;

	this._applyAttributes(content.length);
};

TermBuffer.prototype._mkBlanks = function(n) {
	return Array(Math.max(n,0)+1).join(BLANK);
};

TermBuffer.prototype._applyAttributes = function(len) {
	var i = 0;
	var c = this._cursor;
	len = len || 1;
	var line = this._buffer.attr[c.y];
	for(i = 0; i < len; i++) {
		line[c.x+len] = this._attributes;
	}

	this._attributesApplied = true;
	return this;
};

TermBuffer.prototype.toString = function() {
	return this._buffer.str.join('\n');
};

TermBuffer.prototype.setAttribute = setterFor("attribute");
TermBuffer.prototype.setMode = setterFor("mode");
