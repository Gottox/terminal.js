var TermBuffer = terminal.TermBuffer;
function newTermBuffer(w, h) {
	var t = new TermBuffer(w, h);
	t.mode.crlf = true;
	return t;
}
describe('TermBuffer', function() {
	it("creates TermBuffer", function() {
		expect(newTermBuffer()).to.have.property('buffer');
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
	it("breaks lines", function() {
		var t = newTermBuffer(10, 10);
		t.inject("1234567890abcdefghi");
		expect(t.toString()).to.be("1234567890\nabcdefghi");
		t.inject("j");
		expect(t.toString()).to.be("1234567890\nabcdefghij");
	});
	it("scrolls", function() {
		var t = newTermBuffer(10, 10);
		t.inject("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20");
		expect(t.toString()).to.be("11\n12\n13\n14\n15\n16\n17\n18\n19\n20");
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
		t.deleteLines(2)
		expect(t.toString()).to.be("1\n4");
	});
	// Move this test to term_writer
	/*it("shouldn't print non printables", function() {
		var t = newTermBuffer();
		t.inject("\x0e\x0f");
		expect(t.toString()).to.be("");
	});*/
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
		t.inject("ABCDEF")
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
	})
	it("works wrap = false and with lineFeed", function() {
		var t = newTermBuffer(10,24);
		t.mode.wrap = false;
		t.inject("abc\n1234567890a");
		expect(t.toString()).to.be("abc\n123456789a");
		t.inject("b");
		expect(t.toString()).to.be("abc\n123456789b");
	})
});
