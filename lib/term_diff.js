var myUtil = require('./util.js');

function getChanged(oldObj, newObj) {
	var result = {};
	var i;
	if(newObj instanceof Array) {
		for(i = 0; i < newObj.length || i < oldObj.length; i++) {
			if(newObj[i] !== oldObj[i])
				result[i] = newObj[i];
		}
	}
	else {
		for(i in newObj) {
			if(newObj[i] !== oldObj[i])
				result[i] = newObj[i];
		}
	}
	return result;
}

function TermDiff(oldBuffer, newBuffer) {
	this._changes = [];
	this._cursor = null;
	this._scrollRegion = null;
	this._savedCursor = null;
	this._modes = null;
	this._leds = null;
	this._size = null;
	this._tabs = null;
	this._width = null;
	this._height = null;

	if(typeof oldBuffer === 'object' && oldBuffer.getLine) {
		this.oldBuffer = oldBuffer;
		this.newBuffer = newBuffer;

		this._mkDiff(oldBuffer, newBuffer);
		this._mkCursor(oldBuffer, newBuffer);
		this._mkScrollRegion(oldBuffer, newBuffer);
		this._mkModes(oldBuffer, newBuffer);
		this._mkLeds(oldBuffer, newBuffer);
		this._mkSize(oldBuffer, newBuffer);
		this._mkTabs(oldBuffer, newBuffer);
	}
	else if(typeof oldBuffer === 'string') {
		var json = JSON.parse(oldBuffer);
		this._loadJson(json);
	}
	else {
		this._loadJson(oldBuffer);
	}
}
module.exports = TermDiff;

TermDiff.prototype._mkCursor = function(oldBuffer, newBuffer){
	var cursor = {cursor:'_cursor', _savedCursor:'_savedCursor'};
	for(var k in cursor) {
		if(oldBuffer[k].x !== newBuffer[k].x || oldBuffer[k].y !== newBuffer[k].y)
			this[cursor[k]] = myUtil.extend({}, newBuffer[k]);
	}
};

TermDiff.prototype._mkScrollRegion = function(oldBuffer, newBuffer){
	this._scrollRegion = newBuffer._scrollRegion.slice();
};

TermDiff.prototype._mkModes = function(oldBuffer, newBuffer){
	this._modes = getChanged(oldBuffer._modes, newBuffer._modes);
};

TermDiff.prototype._mkLeds = function(oldBuffer, newBuffer){
	this._leds = getChanged(oldBuffer._leds, newBuffer._leds);
};

TermDiff.prototype._mkSize = function(oldBuffer, newBuffer){
	if(oldBuffer.width !== newBuffer.width || oldBuffer.height !== newBuffer.height) {
		this._height = newBuffer.height;
		this._width = newBuffer.width;
	}
};

TermDiff.prototype._mkTabs = function(oldBuffer, newBuffer){
	this._tabs = newBuffer._tabs.slice();
};


TermDiff.prototype._getChange = function(line) {
	var l = {l: line};
	for(var i = this._changes.length - 1; i >= 0; i--) {
		if(this._changes[i].l == line)
			return this._changes[i];
		else if(this._changes[i].l < line) {
			this._changes.splice(i+1, 0, l);
			return l;
		}
	}
	this._changes.unshift(l);
	return l;
};

TermDiff.prototype._cmpLines = function(line1, line2) {
	var a, p;
	if(line1 === line2)
		return true;
	else if(line1 === undefined || line2 === undefined)
		return false;
	else if(line1.str !== line2.str)
		return false;

	for(a in line1.attr) {
		for(p in line1.attr[a]) {
			if(line1.attr[p] !== line2.attr[p])
				return false;
		}
	}

	for(a in line2.attr) {
		for(p in line2.attr[a]) {
			if(line1.attr[p] !== line2.attr[p])
				return false;
		}
	}

	return true;
};

TermDiff.prototype._mkDiff = function(oldBuffer, newBuffer) {
	var m = Math.max(1, oldBuffer.getBufferHeight()),
	n = Math.max(1, newBuffer.getBufferHeight());

	var left = -1, up = -m, diag = left + up;
	var seq = Array(m * n);
	var dir = seq.slice(0);
	var i,j;

	var tmp = "";
	for(i = 0; i < seq.length; i++) {
		j = i % m;
		k = ~~(i / m); // Cast to int
		var hasDiffs = this._cmpLines(oldBuffer.getLine(j), newBuffer.getLine(k));
		if(hasDiffs)
			dir[i] = diag;
		else if(seq[i + left] <= seq[i + up])
			dir[i] = up;
		else
			dir[i] = left;
		seq[i] = ~~(diag === dir[i]) + ~~(j === 0 ? 0 : seq[i + dir[i]]);
	}

	var k = n-1, toJ, toK;
	j = m-1;
	for(i = seq.length - 1; i >= 0; j--, k--, i+=dir[i]) {
		// Goto next common line
		for(; !isNaN(i) && dir[i] !== diag; i += dir[i]);

		toJ = i % m;
		toK = ~~(i / m); // Cast to int
		if(isNaN(i))
			toJ = toK = -1;

		// changed or inserted
		for(; k > toK; j = Math.max(j-1, toJ), k--) {
			this._getChange(k)[j > toJ ? '.' : '+'] = newBuffer.getLine(k);
		}

		// line is in old, but not in new
		for(; j > toJ; j--) {
			l = this._getChange(toK+1);
			l['-'] = (l['-'] || 0) + 1;
		}

		if(j === 0 && (dir[i] === diag || dir[i] === left))
			dir[i] = up;
	}
};

TermDiff.prototype.toJSON = function() {
	return {
		changes: this._changes,
		cursor: this._cursor,
		savedCursor: this._savedCursor,
		leds: this._leds,
		modes: this._modes,
		size: this._size,
		tabs: this._tabs,
		scrollRegion: this._scrollRegion
	};
};

TermDiff.prototype.toString = function() {
	var i,j;
	var result = [];
	var lastline = 0;
	var oldNbr = this._changes[0] ? this._changes[0].l : 0;
	for(i = 0; i < this._changes.length; i++, lastline++, oldNbr++) {
		for(; lastline < this._changes[i].l; lastline++, oldNbr++) {
			result.push(' ' + this.newBuffer.getLine(lastline).str);
		}
		for(j = 0; j < this._changes[i]['-']; j++) {
			result.push('-' + this.oldBuffer.getLine(oldNbr).str);
		}
		if(this._changes[i]['+']) {
			result.push('+' + this._changes[i]['+'].str);
			oldNbr--;
		}
		if(this._changes[i]['.']) {
			result.push('.' + this._changes[i]['.'].str);
		}
	}
	return result.join('\n');
};

TermDiff.prototype._loadJson = function(diff) {
	this._cursor = diff.cursor;
	this._savedCursor = diff.savedCursor;
	this._scrollRegion = diff.scrollRegion;
	this._modes = diff.modes;
	this._leds = diff.leds;
	this._height = diff.height;
	this._width = diff.width;
	this._changes = diff.changes;
	this._tabs = diff.tabs;
};

TermDiff.prototype.apply = function(diff) {
	if(this._width || this._height) this._applySize(diff);
	if(this._cursor) this._applyCursor(diff);
	if(this._scrollRegion) this._applyScrollRegion(diff);
	if(this._leds) this._applyLeds(diff);
	if(this._tabs) this._applyTabs(diff);
	if(this._savedCursor)this._applySavedCursor(diff);
	if(this._modes) this._applyModes(diff);
	if(this._changes) this._applyChanges(diff);
};

TermDiff.prototype._applySize = function(t) {
	t.resize(this._width, this._height);
};

TermDiff.prototype._applyCursor = function(t) {
	t.setCursor(this._cursor.x, this._cursor.y);
};

TermDiff.prototype._applyScrollRegion = function(t) {
	t.setScrollRegion(this._scrollRegion[0], this._scrollRegion[1]);
};

TermDiff.prototype._applyLeds = function(t) {
	for(var k in this._leds)
		t.setLed(k, this._leds[k]);
};

TermDiff.prototype._applySavedCursor = function(t) {
	t._savedCursor.x = this._savedCursor.x;
	t._savedCursor.y = this._savedCursor.y;
};

TermDiff.prototype._applyTabs = function(t) {
	t.tabs = this._tabs.splice(0);
};

TermDiff.prototype._applyModes = function(t) {
	for (var m in this._modes) {
		t.setMode(m,this._modes[m]);
	}
};

TermDiff.prototype._applyChanges = function(t) {
	for(var i = 0; i < this._changes.length; i++) {
		var c = this._changes[i];
		if (c['-'])
			t._removeLine(c.l, c['-']); // removing lines

		if (c['+'])
			t._insertLine(c.l, c['+']); // adding lines
		else if (c['.'])
			t.setLine(c.l, c['.']); // replacing lines
	}
};
