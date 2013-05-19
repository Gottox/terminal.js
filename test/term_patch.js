describe('TermPatch', function() {
	var TermBuffer = Terminal.TermBuffer;
	var TermPatch = Terminal.TermPatch;
	function newTermBuffer(w, h) {
		var t = new TermBuffer(w, h);
		t.setMode('crlf', true);
		return t;
	}

	it("correctly applies size", function() {
		var t1 = newTermBuffer(80,24);
		var d = { size: [ { from: { 'height': 80, 'width':24 }, to: { 'height': 30, 'width':12 } } ] };
		var p = new TermPatch(t1);
		p.apply(d);
		expect(t1.height).to.be(30);
		expect(t1.width).to.be(12);
	});

	it("correctly applies cursor", function() {
		var t1 = newTermBuffer(80,24);
		var d = { cursor: [ { from: { 'x': 0, 'y':10 }, to: { 'x': 10, 'y':12 } } ] };
		var p = new TermPatch(t1);
		p.apply(d);
		expect(t1.cursor.x).to.be(10);
		expect(t1.cursor.y).to.be(12);
	});

	it("correctly applies scrollRegion", function() {
		var t1 = newTermBuffer(80,24);
		var d = { scrollregion: [ {from: [ 0, 23 ], to: [ 0, 12 ] } ] };
		var p = new TermPatch(t1);
		p.apply(d);
		expect(t1._scrollRegion[0]).to.be(0);
		expect(t1._scrollRegion[1]).to.be(12);
	});

	it("correctly applies leds", function() {
		var t1 = newTermBuffer(80,24);
		var d = { leds: [ { '0': true }] };
		var p = new TermPatch(t1);
		p.apply(d);
		expect(t1._leds[0]).to.be(true);
		expect(t1._leds[1]).to.be(false);
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
