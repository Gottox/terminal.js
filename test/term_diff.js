describe('TermDiff', function() {
	var TermBuffer = Terminal.TermBuffer;
	var TermDiff = Terminal.TermDiff;
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

	it("detects no saved cursor changes if the terminals are not different", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		t1.inject('a');
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().savedcursor.length).to.be(0);
	});

	it("detects saved cursor changes if the terminals are different", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		t1.inject('a');
		t1.inject('\n');
		t1.inject('a');
		t1.saveCursor();
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().savedcursor.length).to.be(1);
		expect(d.toJSON().savedcursor[0].from.x).to.be(1);
		expect(d.toJSON().savedcursor[0].from.y).to.be(1);
		expect(d.toJSON().savedcursor[0].to.x).to.be(0);
		expect(d.toJSON().savedcursor[0].to.y).to.be(0);
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

	it("detects no tabs differences if the terminals are the same", function() {
		var t1 = newTermBuffer();
		var t2 = newTermBuffer();
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().tabs.length).to.be(0);
	});

	it("detects tabs differences if the terminals are different", function() {
		var t1 = newTermBuffer(10,20);
		var t2 = newTermBuffer(12,30);
		t1.inject("a");
		t1.setTab();
		var d = new TermDiff(t1, t2);
		expect(d.toJSON().tabs.length).to.be(1);
		expect(d.toJSON().tabs[0].from[0]).to.equal(1);
		expect(d.toJSON().tabs[0].to.length).to.be(0);
	});

	it("correctly applies size", function() {
		var t1 = newTermBuffer(80,24);
		var d = { size: [ { from: { 'height': 80, 'width':24 }, to: { 'height': 30, 'width':12 } } ] };
		var p = new TermDiff(d);
		p.apply(t1);
		expect(t1.height).to.be(30);
		expect(t1.width).to.be(12);
	});

	it("correctly applies cursor", function() {
		var t1 = newTermBuffer(80,24);
		var d = { cursor: [ { from: { 'x': 0, 'y':10 }, to: { 'x': 10, 'y':12 } } ] };
		var p = new TermDiff(d);
		p.apply(t1);
		expect(t1.cursor.x).to.be(10);
		expect(t1.cursor.y).to.be(12);
	});

	it("correctly applies savedCursor", function() {
		var t1 = newTermBuffer(80,24);
		var d = { savedcursor: [ { from: { 'x': 0, 'y':10 }, to: { 'x': 10, 'y':12 } } ] };
		var p = new TermDiff(d);
		p.apply(t1);
		expect(t1._savedCursor.x).to.be(10);
		expect(t1._savedCursor.y).to.be(12);
	});

	it("correctly applies scrollRegion", function() {
		var t1 = newTermBuffer(80,24);
		var d = { scrollregion: [ {from: [ 0, 23 ], to: [ 0, 12 ] } ] };
		var p = new TermDiff(d);
		p.apply(t1);
		expect(t1._scrollRegion[0]).to.be(0);
		expect(t1._scrollRegion[1]).to.be(12);
	});

	it("correctly applies leds", function() {
		var t1 = newTermBuffer(80,24);
		var d = { leds: [ { '0': true }] };
		var p = new TermDiff(d);
		p.apply(t1);
		expect(t1._leds[0]).to.be(true);
		expect(t1._leds[1]).to.be(false);
	});

	it("correctly applies tabs", function() {
		var t1 = newTermBuffer(80,24);
		var d = { tabs: [ { 'from': [] , 'to': [1] }] };
		var p = new TermDiff(d);
		p.apply(t1);
		expect(t1.tabs.length).to.be(1);
		expect(t1.tabs[0]).to.be(1);
	});
	/*

	it("correctly applies remove Line", function() {
		var t1 = newTermBuffer(80,24);
		var d = { changes: [ { '0': true }] };
		var p = new TermPatch(t1);
		p.apply(d);
		expect(t1._leds[0]).to.be(true);
		expect(t1._leds[1]).to.be(false);
	});
	*/

});
