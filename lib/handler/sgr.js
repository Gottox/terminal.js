var tmp;
module.exports = {
	0: function(cmd) {
		this.buffer.resetAttr();
	},
	1: function(cmd) {
		this.buffer.chAttr('bold', true);
	},
	3: function(cmd) {
		this.buffer.chAttr('italic', true);
	},
	4: function(cmd) {
		this.buffer.chAttr('underline', true);
	},
	5: '6',
	6: function(cmd) {
		this.buffer.chAttr('blink', true);
	},
	7: function(cmd) {
		if(!this.buffer.attr.inverse) {
			this.buffer.chAttr('inverse', true);
			tmp = this.buffer.attr.fg;
			this.buffer.chAttr('fg', this.buffer.attr.bg);
			this.buffer.chAttr('bg', tmp);
		}
	},
	22: function(cmd) {
		this.buffer.resetAttr('bold');
	},
	23: function(cmd) {
		this.buffer.chAttr('italic', false);
	},
	24: function(cmd) {
		this.buffer.chAttr('underline', false);
	},
	25: function(cmd) {
		this.buffer.chAttr('blink', false);
	},
	27: function(cmd) {
		if(this.buffer.attr.inverse) {
			this.buffer.chAttr('inverse', false);
			tmp = this.buffer.attr.fg;
			this.buffer.chAttr('fg', this.buffer.attr.bg);
			this.buffer.chAttr('bg', tmp);
		}
	},

	30: '37', 31: '37', 32: '37', 33: '37', 34: '37', 35: '37', 36: '37',
	37: function(cmd) {
		this.buffer.chAttr('fg', (+cmd) - 30);
	},

	38: function(cmd) {
		// TODO 255 color support
	},
	39: function(cmd) {
		this.buffer.resetAttr('fg');
	},

	40: '47', 41: '47', 42: '47', 43: '47', 44: '47', 45: '47', 46: '47',
	47: function(cmd) {
		this.buffer.chAttr('bg', (+cmd) - 40);
	},
	48: function(cmd) {
		// TODO 255 color support
	},
	49: function(cmd) {
		this.buffer.resetAttr('bg');
	},

	90: '97', 91: '97', 92: '97', 93: '97', 94: '97', 95: '97', 96: '97',
	97: function(cmd) {
		this.buffer.chAttr('fg', (+cmd) - 90 + 8);
	},
	100: '107', 101: '107', 102: '107', 103: '107', 104: '107', 105: '107', 106: '107',
	107: function(cmd) {
		this.buffer.chAttr('bg', (+cmd) - 100 + 8);
	}
};
