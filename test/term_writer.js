describe('TermWriter', function() {
	var TermBuffer = Terminal.TermBuffer;
	var TermWriter = Terminal.TermWriter;
	var TermDiff = Terminal.TermDiff;
	function newTermWriter(w, h) {
		var t = new TermBuffer(w, h), tw = new TermWriter(t);
		t.setMode('crlf', true);
		return tw;
	}
	it("can handle splitted escape sequences", function() {
		var t = newTermWriter();
		t.write("\x1b");
		t.write("[");
		t.write("10");
		t.write(";");
		t.write("2");
		t.write("0");
		t.write("H");
		expect(t.buffer.cursor.x).to.be(19);
		expect(t.buffer.cursor.y).to.be(9);
	});
	it("should handle mode changes correctly", function() {
		var t = newTermWriter();
		t.write("\x1b[?999h");
		t.write("\x1b[?47h");
		t.write("\x1b[?1047h");
		t.write("\x1b[?1048h");
		t.write("\x1b[?1049h");
		t.write("\x1b[?1046h");
		expect(t.toString()).to.be("");
	});
	it("shouldn't print non printables", function() {
		var t = newTermWriter();
		t.write("\x0e\x0f");
		expect(t.toString()).to.be("");
	});
	it("should clear", function() {
		var t = newTermWriter(80,10);
		t.write("ABCDEF\n\nFOO\n\x1b[H\x1b[2J");
		expect(t.toString()).to.be("\n\n\n\n\n\n\n\n\n");
	});
	it("moves down and to beginning of line (NEL)", function() {
		var t = newTermWriter();
		t.write("aaa\x1bEbbb");
		expect(t.toString()).to.be("aaa\nbbb");
	});
	it("moves down and at current position (IND)", function() {
		var t = newTermWriter();
		t.write("aaa\x1bDbbb");
		expect(t.toString()).to.be("aaa\n   bbb");
	});
	it("should save and restore the cursor correctly (DECSC) and (DESCR)", function() {
		var t = newTermWriter(80,24);
		t.write("\x1b7ABCDE\x1b8FGH");
		expect(t.toString()).to.be("FGHDE");
	});
	/* Failing test
	it("should keep attributes on pageup and newline", function() {
		var t = newTermWriter(80,24);
		t.write("\x1b[0;1mBold\x1b[0m\n\x1b[A\n");
		expect(t.toString()).to.be("Bold\n");
		expect(t.buffer.getLine(0).attr['0'].bold).to.be(true);
	}); */
	it("should reverse the terminal correctly", function() {
		var t = newTermWriter(80,24);
		expect(t.buffer._modes.reverse).to.be(false);
		t.write("\x1b[?5hABCDEFGH");
		expect(t.buffer._modes.reverse).to.be(true);
		t.write("\x1b[?5l");
		expect(t.buffer._modes.reverse).to.be(false);
		expect(t.toString()).to.be("ABCDEFGH");
	});

	it("should set Leds", function() {
		var t1 = newTermWriter();
		expect(t1.buffer.getLed(0)).to.be(false);
		expect(t1.buffer.getLed(1)).to.be(false);
		expect(t1.buffer.getLed(2)).to.be(false);
		expect(t1.buffer.getLed(3)).to.be(false);
		t1.write("\x1b[0q\x1b[1q\x1b[2q\x1b[3q");
		expect(t1.buffer.getLed(0)).to.be(true);
		expect(t1.buffer.getLed(1)).to.be(true);
		expect(t1.buffer.getLed(2)).to.be(true);
		expect(t1.buffer.getLed(3)).to.be(true);
	});

	it("should reset (RIS)", function() {
		var t1 = newTermWriter();
		var t2 = newTermWriter();
		//change mode, led and write a char
		t1.write("\x1b[?5h\x1b[1qABCD\x1bc");
		var d = new TermDiff(t1.buffer,t2.buffer);
		expect(d.toJSON().changes.length).to.be(0);
	});

	it("moves down and to beginning of line (NEL)", function() {
		var t = newTermWriter();
		t.write("aaa\x1bEbbb");
		expect(t.toString()).to.be("aaa\nbbb");
	});
	it("moves down and at current position (IND)", function() {
		var t = newTermWriter();
		t.write("aaa\x1bDbbb");
		expect(t.toString()).to.be("aaa\n   bbb");
	});
	it("should save and restore the cursor correctly (DECSC) and (DESCR)", function() {
		var t = newTermWriter(80,24);
		t.write("\x1b7ABCDE\x1b8FGH");
		expect(t.toString()).to.be("FGHDE");
	});
	it("rings bell", function(done) {
		var t = newTermWriter();
		t.on('bell', function() {
			done();
		});
		t.write("\x07");
		expect(t.toString()).to.be("");
	});
	it("should set ScrollRegion correctly if no params specified", function() {
		var t = newTermWriter(80,13);
		t.write("ABCDEF\n\x1b[1;r");
		expect(t.buffer._scrollRegion[1]).to.be(12);
	});
	it("should set ScrollRegion correctly if params specified", function() {
		var t = newTermWriter(80,24);
		t.write("ABCDEF\n\x1b[1;20r");
		expect(t.buffer._scrollRegion[0]).to.be(0);
		expect(t.buffer._scrollRegion[1]).to.be(19);
	});
	it("should scroll correctly when scrollregion is set", function() {
		var t = newTermWriter(80,24);
		t.write("line1\nline2\nline3\nline4\n\x1b[4;5r");
		t.write("\n\n\n\n\n\n");
		expect(t.buffer.toString()).to.be('line1\nline2\nline3\n\n');
	});
	it("keeps correct size", function() {
		var t = newTermWriter(80,24);
		t.write("\x1b[24;1Hline1\nline2");
		expect(t.buffer.getBufferHeight()).to.be(24);
	});

	it("enters graphicsmode", function() {
		var t = newTermWriter(10,10);
		t.write('\x1b(0');
		expect(t.buffer.getMode('graphic')).to.be(true);
	});

	it("leaves graphicsmode", function() {
		var t = newTermWriter(10,10);
		t.write('\x1b(0a\x1b(B');
		expect(t.buffer.getMode('graphic')).to.be(false);
	});

	it("should convert chars graphicsmode", function() {
		var t = newTermWriter(10,10);
		t.write('\x1b(0a\x1b(Ba');
		expect(t.buffer.getMode('graphic')).to.be(false);
		expect(t.buffer.toString()).to.be('▒a');
	});

	it("emits finish after write", function(done) {
		var t = newTermWriter(80,24);
		t.once('finish', function() {
			done();
		});
		t.write("foo");
	});
});
