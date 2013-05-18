function TermDiff(oldBuffer, newBuffer) {
	this._changes = [];
	this._cursor = [];
	this._scrollRegion = [];
	this._modes = [];
	this._leds = [];
	this._size = [];

	if(typeof oldBuffer === 'object' && oldBuffer.getLine) {
		this.oldBuffer = oldBuffer;
		this.newBuffer = newBuffer;
		this._mkDiff(oldBuffer, newBuffer);
	}
	else if(typeof oldBuffer === 'string') {
		var json = JSON.parse(oldBuffer);
		this._validateDiff(json);
	}
	else {
		this._validateDiff(oldBuffer);
	}

	this._getModeChange(oldBuffer,newBuffer);
	this._getLedChange(oldBuffer,newBuffer);
	this._getCursorChange(oldBuffer,newBuffer);
	this._getScrollRegionChange(oldBuffer,newBuffer);
	this._getSizeChange(oldBuffer,newBuffer);

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
	if (o.cursor.x !== n.cursor.x || o.cursor.y !== n.cursor.y) {
		this._cursor.push({ 'from': { 'x': o.cursor.x , 'y': o.cursor.y}, 'to': { 'x': n.cursor.x , 'y': n.cursor.y}});
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
		leds: this._leds,
		modes: this._modes,
		size: this._size,
		scrollregion: this._scrollRegion
	};
};

TermDiff.prototype.toString = function() {
	var i,j;
	var result = [];
	var lastline = 0;
	var oldNbr = this._changes[0] ? this._changes[0].l : 0;
	for(i = 0; i < this._changes.length; i++, lastline++, oldNbr++) {
		for(; lastline < this._changes[i].l; lastline++, oldNbr++)
			result.push(' ' + this.newBuffer.getLine(lastline).str);
		for(j = 0; j < this._changes[i]['-']; j++)
			result.push('-' + this.oldBuffer.getLine(oldNbr).str);
		if(this._changes[i]['+']) {
			result.push('+' + this._changes[i]['+'].str);
			oldNbr--;
		}
		if(this._changes[i]['.'])
			result.push('.' + this._changes[i]['.'].str);
	}
	return result.join('\n');
};
