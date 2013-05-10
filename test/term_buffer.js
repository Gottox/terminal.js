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
		t.write("Hello World");
		expect(t.toString()).to.be("Hello World");
		t.write("\nHello World");
		expect(t.toString()).to.be("Hello World\nHello World");
		//t.write("\n");
		//expect(t.toString()).to.be("Hello World\nHello World\n");
	});
	it("breaks lines", function() {
		var t = newTermBuffer(10, 10);
		t.write("1234567890abcdefghi");
		expect(t.toString()).to.be("1234567890\nabcdefghi");
		t.write("j");
		expect(t.toString()).to.be("1234567890\nabcdefghij");
	});
	it("scrolls", function() {
		var t = newTermBuffer(10, 10);
		t.write("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20");
		expect(t.toString()).to.be("11\n12\n13\n14\n15\n16\n17\n18\n19\n20");
	});
	it("moves cursor up", function() {
		var t = newTermBuffer();
		t.write("Test\nTest");
		t.mvCur(0, -1);
		t.write("!");
		expect(t.toString()).to.be("Test!\nTest");

		t = newTermBuffer();
		t.write("Test\nTest");
		t.mvCur(0, -2);
		t.write("!");
		expect(t.toString()).to.be("Test!\nTest");
	});
	it("moves cursor down", function() {
		var t = newTermBuffer();
		t.write("Test\nTest");
		t.mvCur(0,1);
		t.write("!");
		expect(t.toString()).to.be("Test\nTest\n    !");
	});
	it("moves cursor left", function() {
		var t = newTermBuffer();
		t.write("Tesd");
		t.mvCur(-1,0);
		t.write("t");

		expect(t.toString()).to.be("Test");
		t.mvCur(-100,0);
		t.write("Hello World");
		expect(t.toString()).to.be("Hello World");
	});
	it("moves cursor right", function() {
		var t = newTermBuffer();
		t.write("Tes");
		t.mvCur(1,0);
		t.write("t");
		expect(t.toString()).to.be("Tes t");
	});
	it("moves down and to beginning of line (NEL)", function() {
		var t = newTermBuffer();
		t.write("aaa\x1bEbbb")
		expect(t.toString()).to.be("aaa\nbbb")
	});
	it("moves down and at current position (IND)", function() {
		var t = newTermBuffer();
		t.write("aaa\x1bDbbb")
		expect(t.toString()).to.be("aaa\n   bbb")
	});
	it("deletes lines", function() {
		var t = newTermBuffer();
		t.write("1\n2\n3\n4\x1b[2H\x1b[2M");
		expect(t.toString()).to.be("1\n4");
	});
	it("shouldn't print non printables", function() {
		var t = newTermBuffer();
		t.write("\x0e\x0f");
		expect(t.toString()).to.be("");
	});
	it("should overwrite the previous line when moving the cursor up", function() {
		var t = newTermBuffer();
		t.write("ABCDEF\n\x1b[AGHIJKL");
		expect(t.toString()).to.be("GHIJKL");
	});
	it("should set ScrollRegion correctly if no params specified", function() {
		var t = newTermBuffer(80,13);
		t.write("ABCDEF\n\x1b[1;r");
		expect(t.scrollRegion[1]).to.be(13);
	});
	it("should save and restore the cursor correctly", function() {
		var t = newTermBuffer(80,24);
		t.write("\x1b7ABCDE\x1b8FGH");
		expect(t.toString()).to.be("FGHDE");
	});
	it("should reverse the terminal correctly", function() {
		var t = newTermBuffer(80,24);
		expect(t.mode['reverse']).to.be(false);
		t.write("\x1b[?5hABCDEFGH");
		expect(t.mode['reverse']).to.be(true);
		t.write("\x1b[?5l");
		expect(t.mode['reverse']).to.be(false);
		expect(t.toString()).to.be("ABCDEFGH");
	});
	it("should move Left", function() {
		var t = newTermBuffer();
		t.write("ABCDEF\x1b[DAA");
		expect(t.toString()).to.be("ABCDEAA");
	});
	it("should clear", function() {
		var t = newTermBuffer();
		t.write("ABCDEF\n\nFOO\n\x1bH\x1b[2J");
		expect(t.toString()).to.be("");
	});
	it("should reset (RIS)", function() {
		var t1 = new TermBuffer(80,24);
		var t2 = new TermBuffer(80,24);
		//change mode, led and write a char
		t1.write("\x1b[?5h\x1b[1qABCD\x1bc");
		expect(t1.diff(t2).length).to.be(0);
	});
	it("resize correctly to smaller size", function() {
		var t = newTermBuffer(80,24);
		t.write("line1\n");
		t.resize(2,2);
		t.write("ab\n");
		expect(t.toString()).to.be("ab\n");
	});
	it("resize correctly to bigger size", function() {
		var t = newTermBuffer(80,24);
		t.write("line1\n");
		t.resize(80,28);
		expect(t.toString()).to.be("\n\n\n\nline1");
	});
	it("emits a linechange event", function(done) {
		var t = newTermBuffer();
		t.once('linechange', function(nbr, line) {
			done();
		});
		t.inject("A");
	});
});
