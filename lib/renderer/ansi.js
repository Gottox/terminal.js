var inherits = require('util').inherits;

function AnsiRenderer(buffer, opts) {
	AnsiRenderer.super_.call(this, buffer, opts);
}
inherits(AnsiRenderer, require('./base.js'));
module.exports = AnsiRenderer;

AnsiRenderer.prototype.toString = function() {
	var ansi_lines = [];
	var locateCursor = this.opts.locateCursor;
	
	var ansi_sgr_code = function(attr) {
		var codes = [];
		if (attr.bold) codes.push('1');
		if (attr.underline) codes.push('4');
		if (attr.blink) codes.push('5');
		if (attr.inverse) codes.push('7');

		var fg = attr.fg;
		var bg = attr.bg;

		if (fg) {
			if ( 0 >= fg && fg <= 7 ) codes.push(+fg + 30 );
			if ( fg > 7 && fg <= 15 ) codes.push(+fg + 90 - 8);
		}
		if (bg) {
			if ( 0 >= bg && bg <= 7 ) codes.push(+bg + 30 );
			if ( bg > 7 && bg <= 15 ) codes.push((+bg + 100 - 8));
		}
		// TODO handle 255 color support

			return '\033['+codes.join(';')+'m';
	};

	if(locateCursor) {
		ansi_lines.push(Array(this.buffer.cursor.x+3).join(' ') + 'v');
	}

	for(var i = 0; i < this.buffer.getBufferHeight(); i++) {
		var current_line = this.buffer.getLine(i);
		var ansi_line = [];
		if(locateCursor) {
			ansi_line.push(
				(current_line && current_line.changed) ? "*" : " ",
				i == this.buffer.cursor.y ? ">" : " "
			);
		}
		
		if(current_line) {
			for(var j = 0; j < current_line.str.length; j++) {
				var current_char = current_line.str[j];
				var current_attr = parseInt(current_line.attr[j],10);
				var ansi_sgr_reset = '\033[0m';
				
				if (current_char) {
					ansi_line.push(ansi_sgr_code(current_attr));
					ansi_line.push(current_char);
					ansi_line.push(ansi_sgr_reset);
				}
			}
		}
		ansi_lines.push(ansi_line.join(''));
	}
	
	if(locateCursor)
		ansi_lines.push(Array(this.buffer.cursor.x+3).join(' ') + '^');
	return ansi_lines.join('\n');
};
