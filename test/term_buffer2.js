describe('TermBuffer2', function() {
	var TermBuffer = terminal.TermBuffer2;

	function newTermBuffer(w, h) {
		var t = new TermBuffer(w, h);
		t.setMode('crlf', true);
		return t;
	}

	it("creates TermBuffer", function() {
		expect(newTermBuffer()).to.have.property('inject');
		expect(newTermBuffer().toString()).to.be("");
	});
	it("creates TermBuffer with dimension", function() {
		var t = newTermBuffer(100, 200);
		expect(t.width).to.be(100);
		expect(t.height).to.be(200);
	});
	it("writes to TermBuffer", function() {
		var t = newTermBuffer();
		t.inject("Hello World");
		expect(t.toString()).to.be("Hello World");
		t.inject("\nHello World");
		expect(t.toString()).to.be("Hello World\nHello World");
		t.inject("\n");
		expect(t.toString()).to.be("Hello World\nHello World\n");
	});
	it("creates series of blanks", function() {
		var t = newTermBuffer();
		expect(t._mkBlanks(10)).to.be("          ");
	});
	it("breaks lines", function() {
		var t = newTermBuffer(10, 10);
		t.inject("1234567890abcdefghi");
		expect(t.toString()).to.be("1234567890\nabcdefghi");
		t.inject("j");
		expect(t.toString()).to.be("1234567890\nabcdefghij");
	});
	it("handles carriage returns", function() {
		var t = newTermBuffer(10, 10);
		t.inject("1234\r56\r789");
		expect(t.toString()).to.be("7894");
	});
	/*it("scrolls", function() {
		var t = newTermBuffer(10, 10);
		t.inject("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20");
		expect(t.toString()).to.be("11\n12\n13\n14\n15\n16\n17\n18\n19\n20");
	});
	it("scrolls manually", function() {
		var t = newTermBuffer(10, 10);
		t.inject("1\n2\n3\n4\n5\n6\n7\n8\n9\n10");
		t.scroll('down', 5);
		expect(t.toString()).to.be("6\n7\n8\n9\n10\n\n\n\n\n");
		t.reset();
		t.inject("1\n2\n3\n4\n5\n6\n7\n8\n9\n10");
		t.scroll('up', 5);
		expect(t.toString()).to.be("\n\n\n\n\n1\n2\n3\n4\n5");
	});
	it("moves cursor up", function() {
		var t = newTermBuffer();
		t.inject("Test\nTest");
		t.mvCur(0, -1);
		t.inject("!");
		expect(t.toString()).to.be("Test!\nTest");

		t = newTermBuffer();
		t.inject("Test\nTest");
		t.mvCur(0, -2);
		t.inject("!");
		expect(t.toString()).to.be("Test!\nTest");
	});
	it("moves cursor down", function() {
		var t = newTermBuffer();
		t.inject("Test\nTest");
		t.mvCur(0,1);
		t.inject("!");
		expect(t.toString()).to.be("Test\nTest\n    !");
	});
	it("moves cursor left", function() {
		var t = newTermBuffer();
		t.inject("Tesd");
		t.mvCur(-1,0);
		t.inject("t");

		expect(t.toString()).to.be("Test");
		t.mvCur(-100,0);
		t.inject("Hello World");
		expect(t.toString()).to.be("Hello World");
	});
	it("moves cursor right", function() {
		var t = newTermBuffer();
		t.inject("Tes");
		t.mvCur(1,0);
		t.inject("t");
		expect(t.toString()).to.be("Tes t");
	});
	it("deletes lines", function() {
		var t = newTermBuffer();
		t.inject("1\n2\n3\n4");
		t.setCur({y:1});
		t.deleteLines(2);
		expect(t.toString()).to.be("1\n4");
	});
	it("should overwrite the previous line when moving the cursor up", function() {
		var t = newTermBuffer();
		t.inject("ABCDEF\n");
		t.mvCur(0,-1);
		t.inject("GHIJKL");

		expect(t.toString()).to.be("GHIJKL\n");
	});
	it("should set ScrollRegion correctly if no params specified", function() {
		var t = newTermBuffer(80,13);
		t.inject("ABCDEF\n\x1b[1;r");
		expect(t.scrollRegion[1]).to.be(13);
	});
	it("should move Left", function() {
		var t = newTermBuffer();
		t.inject("ABCDEF");
		t.mvCur(-1, 0);
		t.inject("AA");
		expect(t.toString()).to.be("ABCDEAA");
	});
	it("resize correctly to smaller size", function() {
		var t = newTermBuffer(80,24);
		t.inject("line1\n");
		t.resize(2,2);
		t.inject("ab\n");
		expect(t.toString()).to.be("ab\n");
	});
	it("resize correctly to bigger size", function() {
		var t = newTermBuffer(80,24);
		t.inject("line1\n");
		t.resize(80,28);
		expect(t.toString()).to.be("\n\n\n\nline1\n");
	});
	it("emits a linechange event", function(done) {
		var t = newTermBuffer();
		t.once('linechange', function(nbr, line) {
			done();
		});
		t.inject("hello world");
	});
	it("works with wrap = false", function() {
		var t = newTermBuffer(10,24);
		t.mode.wrap = false;
		t.inject("1234567890a");
		expect(t.toString()).to.be("123456789a");
		t.inject("b");
		expect(t.toString()).to.be("123456789b");
	});
	it("works wrap = false and with lineFeed", function() {
		var t = newTermBuffer(10,24);
		t.mode.wrap = false;
		t.inject("abc\n1234567890a");
		expect(t.toString()).to.be("abc\n123456789a");
		t.inject("b");
		expect(t.toString()).to.be("abc\n123456789b");
	});
	it("emits cursor move", function(done) {
		var t = newTermBuffer();
		t.on("cursormove", function(cur) {
			expect(cur.x).to.be(12);
			expect(cur.y).to.be(1);
			done();
		});
		t.inject("Hello World\nHow are you?");
	});
	it("emits line insert events on inject", function(done) {
		var t = newTermBuffer();
		var i = 0;
		t.on('lineinsert', function(number, line) {
			expect(number).to.be(i);
			if(++i === 2)
				done();
		});
		t.inject("test\nbar");
	});
	it("emits line remove events on inject", function(done) {
		var t = newTermBuffer(80, 10);
		t.on('lineremove', function(number, line) {
			expect(number).to.be(0);
			done();
		});
		t.inject("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11");
	});*/
});
