function TermDiff(oldBuffer, newBuffer) {
	this._changes = [];
	this._cursor = {x:0, y:0};

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
}
module.exports = TermDiff;

TermDiff.prototype._getChange = function(line) {
	var l = {l: line};
	for(var i = this._changes.length - 1; i >= 0; i--) {
		if(this._changes[i].l == line)
			return this._changes[i];
		else if(this._changes[i].l < l) {
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
	var m = oldBuffer.getBufferHeight(), n = newBuffer.getBufferHeight();
	var left = -1, up = -m, diag = left + up;
	var seq = Array(m * n);
	var dir = seq.slice(0);
	var i;

	var tmp = "";
	for(i = 0; i < seq.length; i++) {
		j = i % m;
		k = ~~(i / m);
		if(this._cmpLines(oldBuffer.getLine(j), newBuffer.getLine(k)))
			dir[i] = diag;
		else if(seq[i + left] <= seq[i + up])
			dir[i] = up;
		else
			dir[i] = left;
		seq[i] = ~~(diag === dir[i]) + ~~(j === 0 ? 0 : seq[i + dir[i]]);
	}

	var j = m-1, k = n-1, toJ, toK;
	for(i = seq.length - 1; i >= 0; j--, k--, i+=dir[i]) {
		// Goto next common line
		for(; !isNaN(i) && dir[i] !== diag; i += dir[i]);

		toJ = i % m;
		toK = ~~(i / m);
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
		cursor: this._cursor
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
