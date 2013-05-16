var tmp;
module.exports = {
	0: function(cmd) {
		this.buffer.resetAttribute();
	},
	1: function(cmd) { // Bold
		this.buffer.setAttribute('bold', true);
	},
	2: function(cmd) { // Weight:feint
	},
	3: function(cmd) { // Italic
		this.buffer.setAttribute('italic', true);
	},
	4: function(cmd) { // Underline
		this.buffer.setAttribute('underline', true);
	},
	5: '6', // Slowly Blinking
	6: function(cmd) { //Rapidly Blinking
		this.buffer.setAttribute('blink', true);
	},
	7: function(cmd) { // Inverse
		if(!this.buffer.attr.inverse) {
			this.buffer.setAttribute('inverse', true);
			tmp = this.buffer.attr.fg;
			this.buffer.setAttribute('fg', this.buffer.attr.bg);
			this.buffer.setAttribute('bg', tmp);
		}
	},
	8: function(cmd) { // Hidden
	},
	9: function(cmd) { // Strike Through
	},
	20: function(cmd) { // Style:fraktur
	},
	21: function(cmd) { // Double Underlined
	},
	22: function(cmd) {
		this.buffer.resetAttribute('bold');
	},
	23: function(cmd) {
		this.buffer.setAttribute('italic', false);
	},
	24: function(cmd) {
		this.buffer.setAttribute('underline', false);
	},
	25: function(cmd) {
		this.buffer.setAttribute('blink', false);
	},
	27: function(cmd) {
		if(this.buffer.attr.inverse) {
			this.buffer.setAttribute('inverse', false);
			tmp = this.buffer.attr.fg;
			this.buffer.setAttribute('fg', this.buffer.attr.bg);
			this.buffer.setAttribute('bg', tmp);
		}
	},

	30: '37', 31: '37', 32: '37', 33: '37', 34: '37', 35: '37', 36: '37',
	37: function(cmd) {
		this.buffer.setAttribute('fg', (+cmd) - 30);
	},

	38: function(cmd) {
		// TODO 255 color support
	},
	39: function(cmd) {
		this.buffer.resetAttribute('fg');
	},

	40: '47', 41: '47', 42: '47', 43: '47', 44: '47', 45: '47', 46: '47',
	47: function(cmd) {
		this.buffer.setAttribute('bg', (+cmd) - 40);
	},
	48: function(cmd) {
		// TODO 255 color support
	},
	49: function(cmd) {
		this.buffer.resetAttribute('bg');
	},

	51: function(cmd) { // Frame:box
		
	},

	52: function(cmd) { // Frame:circle
		
	},

	53: function(cmd) { // Overlined
		
	},

	90: '97', 91: '97', 92: '97', 93: '97', 94: '97', 95: '97', 96: '97',
	97: function(cmd) {
		this.buffer.setAttribute('fg', (+cmd) - 90 + 8);
	},
	100: '107', 101: '107', 102: '107', 103: '107', 104: '107', 105: '107', 106: '107',
	107: function(cmd) {
		this.buffer.setAttribute('bg', (+cmd) - 100 + 8);
	}
};
