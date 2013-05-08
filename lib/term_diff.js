var util = require('./util');

function TermDiff(terminal) {
	this.cursorX = -1;
	this.cursorLine = null;
	this.oldBuffer = [];
	this.terminal = terminal;
}

TermDiff.prototype = {
	diff: function() {
		var diff = {};
		var i = 0, j = 0;
		var emptyLine = {line:[]};
		var deleted = 0;
		var t = this.terminal;

		// Check if the cursor has changed position
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


		// Compare the oldBuffer and current Buffer
		// a) first run through the lines that are available in both buffers (smallest number of lines of each buffer)
		//    to see if they have lines in common of differ
		for(; i < Math.min(t.buffer.length, this.oldBuffer.length); i++, j++) {
			var line = t.buffer[i] || emptyLine,
				oldLine = this.oldBuffer[j] || emptyLine;

			// We could do smarter and instead of complete lines, see what the lines have in common
			/* var oldInNew = util.indexOf(t.buffer, oldLine),
				newInOld = util.indexOf(this.oldBuffer, line)

			if(oldInNew === -1 && newInOld !== -1) {
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

			// If the line changed(cursor) or the line is different from the oldline
			if(line.changed || line !== oldLine) {
				diff[i] = util.extend({act: 'c', rm: deleted}, line);
			}
			
			deleted = 0;
			delete line.changed;
		}

		// For all the 'extra' lines check to see if they were added or deleted
		deleted = this.oldBuffer.length - j;
		for(; i < t.buffer.length; i++){
			diff[i] = util.extend({act: '+', rm: deleted}, t.buffer[i]);
			if(t.buffer[i])
				delete t.buffer[i].changed;
			deleted = 0;
		}
		if(deleted !== 0)
			diff[i] = {rm: deleted};

		this.oldBuffer = t.buffer.slice(0);
		return diff;
	}
};

exports.TermDiff = TermDiff;
