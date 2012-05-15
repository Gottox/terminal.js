var util = require('./util');

exports.exec = function(term, sgr) {
	for(var i = 0; i < sgr.length; i++) {
		switch(parseInt(sgr[i])) {
		case 0:
			term.resetAttr();
			break;
		case 1:
			term.chAttr('bold', true);
			break;
		case 3:
			term.chAttr('italic', true);
			break;
		case 4:
			term.chAttr('underline', true);
			break;
		case 5:
		case 6:
			term.chAttr('blink', true);
			break;
		case 7:
			if(!term.attr.inverse) {
				term.chAttr('inverse', true);
				var tmp = term.attr.fg;
				term.chAttr('fg', term.attr.bg);
				term.chAttr('bg', tmp);
			}
			break;
		case 22:
			term.resetAttr('bold');
			break;
		case 23:
			term.chAttr('italic', false);
			break;
		case 24:
			term.chAttr('underline', false);
			break;
		case 25:
			term.chAttr('blink', false);
			break
		case 27:
			if(term.attr.inverse) {
				term.chAttr('inverse', false);
				var tmp = term.attr.fg;
				term.chAttr('fg', term.attr.bg);
				term.chAttr('bg', tmp);
			}
			break;
		case 38:
			if(sgr[i+1] == 5)
				term.chAttr('fg', -sgr[i+=2]);
			break
		case 39:
			term.resetAttr('fg');
			break;
		case 48:
			if(sgr[i+1] == 5)
				term.chAttr('bg', -sgr[i+=2]);
			break;
		case 49:
			term.resetAttr('bg');
			break;
		default:
			if(sgr[i] >= 30 && sgr[i] <= 37)
				term.chAttr('fg', sgr[i] - 30);
			else if(sgr[i] >= 40 && sgr[i] <= 47)
				term.chAttr('bg', sgr[i] - 40);
			else if(sgr[i] >= 90 && sgr[i] <= 99)
				term.chAttr('fg', sgr[i] - 90 + 8);
			else if(sgr[i] >= 100 && sgr[i] <= 109)
				term.chAttr('bg', sgr[i] - 100 + 8);
			else
				console.log("Unkown sgr command '"+sgr[i]+"'");
		}
	}
}
