var tmp;
module.exports = {
	0: function(cmd) {
		term.resetAttr();
	},
	1: function(cmd) {
		term.chAttr('bold', true);
	},
	3: function(cmd) {
		term.chAttr('italic', true);
	},
	4: function(cmd) {
		term.chAttr('underline', true);
	},
	5: '6',
	6: function(cmd) {
		term.chAttr('blink', true);
	},
	7: function(cmd) {
		if(!term.attr.inverse) {
			term.chAttr('inverse', true);
			tmp = term.attr.fg;
			term.chAttr('fg', term.attr.bg);
			term.chAttr('bg', tmp);
		}
	},
	22: function(cmd) {
		term.resetAttr('bold');
	},
	23: function(cmd) {
		term.chAttr('italic', false);
	},
	24: function(cmd) {
		term.chAttr('underline', false);
	},
	25: function(cmd) {
		term.chAttr('blink', false);
	},
	27: function(cmd) {
		if(term.attr.inverse) {
			term.chAttr('inverse', false);
			tmp = term.attr.fg;
			term.chAttr('fg', term.attr.bg);
			term.chAttr('bg', tmp);
		}
	},

	30: '37', 31: '37', 32: '37', 33: '37', 34: '37', 35: '37', 36: '37',
	37: function(cmd) {
		term.chAttr('fg', (+cmd) - 30);
	},

	38: function(cmd) {
		// TODO 255 color support
	},
	39: function(cmd) {
		term.resetAttr('fg');
	},

	40: '47', 41: '47', 42: '47', 43: '47', 44: '47', 45: '47', 46: '47',
	47: function(cmd) {
		term.chAttr('bg', (+cmd) - 40);
	},
	48: function(cmd) {
		// TODO 255 color support
	},
	49: function(cmd) {
		term.resetAttr('bg');
	},

	90: '97', 91: '97', 92: '97', 93: '97', 94: '97', 95: '97', 96: '97',
	97: function(cmd) {
		term.chAttr('fg', (+cmd) - 90 + 8);
	},
	100: '107', 101: '107', 102: '107', 103: '107', 104: '107', 105: '107', 106: '107',
	107: function(cmd) {
		term.chAttr('bg', (+cmd) - 100 + 8);
	}
};
