var util = require('./util');

function TermDiff(terminal) {
	this.cursorX = -1;
	this.cursorLine = null;
	this.oldBuffer = [];
	this.terminal = terminal;
}

TermDiff.prototype = {
	diff: function() {
		var diff = {}
		var i = 0, j = 0;
		var emptyLine = {line:[]};
		var deleted = 0;
		var t = this.terminal

		if(this.cursorX !== t.cursor.x || t.buffer[t.cursor.y] !== this.cursorLine) {
			if(this.cursorLine) {
				this.cursorLine.changed = true;
				if(this.cursorLine.line[this.cursorX])
					delete this.cursorLine.line[this.cursorX].cursor;
			}

			this.cursorLine = t.getLine(t.cursor.y);
			this.cursorX = t.cursor.x;
			this.cursorLine.changed = true;
			if(!this.cursorLine.line[t.cursor.x])
				this.cursorLine.line[t.cursor.x] = {};
			this.cursorLine.line[t.cursor.x].cursor = t.mode.cursor;
		}


		for(; i < Math.min(t.buffer.length, this.oldBuffer.length); i++, j++) {
			var line = t.buffer[i] || emptyLine
			  , oldLine = this.oldBuffer[j] || emptyLine
			var oldInNew = util.indexOf(t.buffer, oldLine)
			  , newInOld = util.indexOf(this.oldBuffer, line)

			/*if(oldInNew === -1 && newInOld !== -1) {
				deleted = newInOld - i;
				j += deleted;
				oldLine = this.oldBuffer[j] || emptyLine
				oldInNew = util.indexOf(t.buffer, oldLine)
			}

			if(line.changed || newInOld === -1) {
				if(newInOld === -1) {
					diff[i] = {act: '+', line: line, rm: deleted};
					j--;
				}
				else {
					diff[i] = {act: 'c', line: line, rm: deleted};
				}
			}
			else if(deleted !== 0)
				diff[i] = {rm: deleted};*/
			if(line.changed || line !== oldLine) {
				diff[i] = util.extend({act: 'c', rm: deleted}, line);
			}
			
			deleted = 0;
			delete line.changed
		}
		deleted = this.oldBuffer.length - j
		for(; i < t.buffer.length; i++){
			diff[i] = util.extend({act: '+', rm: deleted}, t.buffer[i]);
			if(t.buffer[i])
				delete t.buffer[i].changed
			deleted = 0;
		}
		if(deleted !== 0)
			diff[i] = {rm: deleted};

		this.oldBuffer = t.buffer.slice(0);
		return diff;
	}
}

exports.TermDiff = TermDiff;
