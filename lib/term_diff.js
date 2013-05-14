function TermDiff(buffer1, buffer2) {
	if(typeof buffer1 === 'object' && buffer1.getLine) {
		this._mkDiff(buffer1, buffer2);
	}
	else if(typeof buffer1 === 'string') {
		var json = JSON.parse(buffer1);
		this._validateDiff(json);
	}
	else {
		this._validateDiff(buffer1);
	}
}
module.exports = TermDiff;

TermDiff.prototype._cmpLines = function(line1, line2) {
	var a, p;
	if(line1.str !== line2.str)
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

// source: http://rosettacode.org/wiki/Longest_common_subsequence#JavaScript
TermDiff.prototype._genLcs = function(lines1, lines2) {
	var s,i,j,m,n,
	lcs=[],row=[],c=[],
	left,diag,latch;
	//make sure shorter string is the column string
	if(lines1.length<lines2.length){s=lines2;lines2=lines1;lines1=s;}
	m = lines1.length;
	n = lines2.length;
	//build the c-table
	for(j=0;j<n;row[j++]=0);
	for(i=0;i<m;i++){
		c[i] = row = row.slice();
		for(diag=0,j=0;j<n;j++,diag=latch){
			latch=row[j];
			if(this._cmpLines(lines1[j], lines2[i])){row[j] = diag+1;}
			else{
				left = row[j-1]||0;
				if(left>row[j]){row[j] = left;}
			}
		}
	}
	i--,j--;
	//row[j] now contains the length of the lcs
	//recover the lcs from the table
	while(i>-1&&j>-1){
		switch(c[i][j]){
			default: j--;
				lcs.unshift([i,j]);
				i--;
				break;
			case (i&&c[i-1][j]):
				i--;
				continue;
			case (j&&c[i][j-1]):
				j--;
				break;
		}
	}
	return lcs;
};


TermDiff.prototype.toJSON = function() {
	return this.changes;
};

TermDiff.prototype.toString = function() {

};
