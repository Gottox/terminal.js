describe('TermDiff', function() {
	var TermBuffer = terminal.TermBuffer;
	var TermDiff = terminal.TermDiff;
	function newTermBuffer(w, h) {
		var t = new TermBuffer(w, h);
		t.setMode('crlf', true);
		return t;
	}

	it("creates TermDiff", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().changes.length).to.be(0);
	});

	it("diffs two terminals", function() {
		// Not Correct, must investigate
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		t1.inject("_FFFFFF".replace(/(.)/g,'$1\n'));
		t2.inject("_ADDE".replace(/(.)/g,'$1\n'));
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().changes.length).to.be(4);
	});

	it("detects led changes", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		t2.setLed(3,true);
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().leds.length).to.be(1);
	});

	it("can't set beyond 4 leds", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		t2.setLed(4,true);
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().leds.length).to.be(0);
	});

	it("detect mode changes", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		t2.setMode('graphic',true);
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().modes.length).to.be(1);
	});

	it("detects no cursor changes if the terminals are the same", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().cursor.length).to.be(0);
	});

	it("detects cursor changes if the terminals are different", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		t1.inject('a');
		t1.inject('\n');
		t1.inject('a');
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().cursor.length).to.be(1);
		expect(d.toJSON().cursor[0].from.x).to.be(1);
		expect(d.toJSON().cursor[0].from.y).to.be(1);
		expect(d.toJSON().cursor[0].to.x).to.be(0);
		expect(d.toJSON().cursor[0].to.y).to.be(0);
	});

	it("detects line changes in second buffer", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		t1.inject('lalal');
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().changes.length).to.be(1);
		expect(d.toJSON().changes[0]['.'].str).to.be('');
	});

	it("detects line changes in first buffer", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		t2.inject('lalal');
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().changes[0]['.'].str).to.be('lalal');
		expect(d.toJSON().changes.length).to.be(1);
	});

	it("detects line removed in the second buffer", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		t1.inject('lalal\n');
		t2.inject('lalal');
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().changes[0]['-']).to.be(1); // Remove of line
		expect(d.toJSON().changes.length).to.be(1);
	});

	it("detects line added in the second buffer", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		t1.inject('lalal');
		t2.inject('lalal\n');
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().changes[0]['+'].str).to.be(''); // Remove of line
		expect(d.toJSON().changes.length).to.be(1);
	});

	it("detects no size differences if the terminals are the same", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().size.length).to.be(0);
	});

	it("detects size differences if the terminals are different", function() {
		var t1 = newTermBuffer(10,20);
		var t2 = newTermBuffer(12,30);
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().size.length).to.be(1);
		expect(d.toJSON().size[0].from.height).to.be(20);
		expect(d.toJSON().size[0].from.width).to.be(10);
		expect(d.toJSON().size[0].to.height).to.be(30);
		expect(d.toJSON().size[0].to.width).to.be(12);
	});

});
