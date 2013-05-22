function TermDiff(oldBuffer, newBuffer) {
	this._changes = [];
	this._cursor = [];
	this._scrollRegion = [];
	this._savedCursor = [];
	this._modes = [];
	this._leds = [];
	this._size = [];
	this._tabs = [];

	if(typeof oldBuffer === 'object' && oldBuffer.getLine) {
		this.oldBuffer = oldBuffer;
		this.newBuffer = newBuffer;
		this._mkDiff(oldBuffer, newBuffer);

		this._getModeChange(oldBuffer,newBuffer);
		this._getLedChange(oldBuffer,newBuffer);
		this._getCursorChange(oldBuffer,newBuffer);
		this._getSavedCursorChange(oldBuffer,newBuffer);
		this._getScrollRegionChange(oldBuffer,newBuffer);
		this._getSizeChange(oldBuffer,newBuffer);
		this._getTabChange(oldBuffer,newBuffer);
	}
	else if(typeof oldBuffer === 'string') {
		var json = JSON.parse(oldBuffer);
		this._validateDiff(json);
	}
	else {
		this._validateDiff(oldBuffer);
	}


}
module.exports = TermDiff;

TermDiff.prototype._getModeChange = function(o,n) {
	for(var k in o._modes) {
		if (o._modes[k] != n._modes[k]) {
			var h = {};
			h[k.toString()] = n._modes[k];
			this._modes.push(h);
		}
	}
};

TermDiff.prototype._getLedChange = function(o,n) {
	for(var i = 0; i < n._leds.length; i++) {
		if (o._leds[i] !== n._leds[i]) {
			var h = {};
			h[i.toString()] = n._leds[i];
			this._leds.push(h);
		}
	}
};

TermDiff.prototype._getCursorChange = function(o,n) {
	if (o.cursor.x !== n.cursor.x || o.cursor.y !== n.cursor.y) {
		this._cursor.push({ 'from': { 'x': o.cursor.x , 'y': o.cursor.y}, 'to': { 'x': n.cursor.x , 'y': n.cursor.y}});
	}
};

TermDiff.prototype._getSavedCursorChange = function(o,n) {
	if (o._savedCursor.x !== n._savedCursor.x || o._savedCursor.y !== n._savedCursor.y) {
		this._savedCursor.push({ 'from': { 'x': o._savedCursor.x , 'y': o._savedCursor.y}, 'to': { 'x': n._savedCursor.x , 'y': n._savedCursor.y}});
	}
};

TermDiff.prototype._getScrollRegionChange = function(o,n) {
	if (o._scrollRegion[0] !== n._scrollRegion[0] || o._scrollRegion[1] !== n._scrollRegion[1]) {
		this._scrollRegion.push({ 'from': [ o._scrollRegion[0] , o._scrollRegion[1]], 'to': [ n._scrollRegion[0] , n._scrollRegion[1]]});
	}
};

TermDiff.prototype._getSizeChange = function(o,n) {
	if (o.width !== n.width || o.height !== n.height) {
		this._size.push({ 'from': { 'width': o.width , 'height': o.height}, 'to': { 'width': n.width , 'height': n.height}});
	}
};

TermDiff.prototype._getTabChange = function(o,n) {
	if (JSON.stringify(o.tabs)!=JSON.stringify(n.tabs)) {
		this._tabs.push({ 'from': o.tabs.splice(0), 'to': n.tabs.splice(0)});
	}
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
		savedcursor: this._savedCursor,
		leds: this._leds,
		modes: this._modes,
		size: this._size,
		tabs: this._tabs,
		scrollregion: this._scrollRegion
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

TermDiff.prototype._validateDiff = function(diff) {
	//TODO really validate
	if (diff.changes) { this._changes = diff.changes.splice(0); }
	if (diff.cursor)  { this._cursor = diff.cursor.splice(0); }
	if (diff.savedcursor) { this._savedCursor = diff.savedcursor.splice(0); }
	if (diff.scrollregion) { this._scrollRegion = diff.scrollregion.splice(0); }
	if (diff.modes) { this._modes = diff.modes.splice(0); }
	if (diff.leds) { this._leds = diff.leds.splice(0); }
	if (diff.size) { this._size = diff.size.splice(0); }
	if (diff.tabs) { this._tabs = diff.tabs.splice(0); }
};

TermDiff.prototype.apply = function(diff) {
	this._applySize(diff);
	this._applyCursor(diff);
	this._applyScrollRegion(diff);
	this._applyLeds(diff);
	this._applyChanges(diff);
	this._applyTabs(diff);
	this._applySavedCursor(diff);
	this._applyModes(diff);
};

TermDiff.prototype._applySize = function(t) {
	if (this._size.length >0) {
		t.height = this._size[0].to.height;
		t.width = this._size[0].to.width;
	}
};

TermDiff.prototype._applyCursor = function(t) {
	if (this._cursor.length >0) {
		t.cursor.x = this._cursor[0].to.x;
		t.cursor.y = this._cursor[0].to.y;
	}
};

TermDiff.prototype._applyScrollRegion = function(t) {
	if (this._scrollRegion.length > 0) {
		t.setScrollRegion(this._scrollRegion[0].to[0] , this._scrollRegion[0].to[1]);
	}
};

TermDiff.prototype._applyLeds = function(t) {
	if (this._leds.length > 0) {
		for (var l in this._leds[0]) {
			t.setLed(l,this._leds[0][+l]);
		}
	}
};

TermDiff.prototype._applySavedCursor = function(t) {
	if (this._savedCursor.length >0) {
		t._savedCursor.x = this._savedCursor[0].to.x;
		t._savedCursor.y = this._savedCursor[0].to.y;
	}
};

TermDiff.prototype._applyTabs = function(t) {
	if (this._tabs.length > 0) {
		t.tabs = this._tabs[0].to.splice(0);
	}
};

TermDiff.prototype._applyModes = function(t) {
	if (this._modes.length > 0) {
		for (var m in this._modes[0]) {
			t.setMode(m,this._modes[0][m]);
		}
	}
};

TermDiff.prototype._applyChanges = function(t) {
	for(var i = 0; i < this._changes.length; i++) {
		var c = this._changes[i];
		if (c['-']) {
			t._removeLine(c.l,c['-']); // removing lines
		}
		if (c['+']) {
			// adding lines
		}
		if (c['.']) {
			// replacing lines
		}
	}
};
