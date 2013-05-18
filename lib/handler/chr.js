// function(cmd, chunk);
module.exports = {
	'\x07': function(cmd, chunk) { // BELL
		this.emit("bell");
	},
	'\x08': function(cmd, chunk) { // BACKSPACE
		this.buffer.mvCursor(-1, 0);
	},
	'\x09': function(cmd, chunk) { // TAB
		this.buffer.mvTab(1);
	},
	'\x7f': function(cmd, chunk) { // DELETE
		this.buffer.removeChar(1);
	},
	'\x88': function(cmd, chunk) { // TABSET
		this.buffer.setTab();
	},
	'\x0e': function() { }, // SO
	'\x0f': function() { }, // SI

	'\x1b': function(cmd, chunk) {
		return chunk[1] !== undefined ?
			this.callHandler('esc', chunk[1], chunk) :
			0;
	}
};
