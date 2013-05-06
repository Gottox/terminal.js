var TermBuffer = terminal.TermBuffer;
function newTermBuffer(w, h) {
	var t = new TermBuffer(w, h);
	t.mode.crlf = true;
	return t;
}
describe('TermBuffer', function() {
	it("creates TermBuffer", function() {
		expect(newTermBuffer()).to.have.property('buffer')
		expect(newTermBuffer().toString()).to.be("")
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
		t.write("1234567890abcdefghi")
		expect(t.toString()).to.be("1234567890\nabcdefghi")
		t.write("j")
		expect(t.toString()).to.be("1234567890\nabcdefghij")
	})
	it("scrolls", function() {
		var t = newTermBuffer(10, 10);
		t.write("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20")
		expect(t.toString()).to.be("11\n12\n13\n14\n15\n16\n17\n18\n19\n20")
	})
	it("moves cursor up", function() {
		var t = newTermBuffer();
		t.write("Test\nTest");
		t.mvCur(0, -1);
		t.write("!");
		expect(t.toString()).to.be("Test!\nTest")

		t = newTermBuffer();
		t.write("Test\nTest");
		t.mvCur(0, -2);
		t.write("!");
		expect(t.toString()).to.be("Test!\nTest")
	})
	it("moves cursor down", function() {
		var t = newTermBuffer();
		t.write("Test\nTest");
		t.mvCur(0,1);
		t.write("!");
		expect(t.toString()).to.be("Test\nTest\n    !")
	})
	it("moves cursor left", function() {
		var t = newTermBuffer();
		t.write("Tesd");
		t.mvCur(-1,0);
		t.write("t");

		expect(t.toString()).to.be("Test")
		t.mvCur(-100,0)
		t.write("Hello World")
		expect(t.toString()).to.be("Hello World");
	});
	it("moves cursor right", function() {
		var t = newTermBuffer();
		t.write("Tes");
		t.mvCur(1,0);
		t.write("t");
		expect(t.toString()).to.be("Tes t")
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
	it("should clear", function() {
		var t = newTermBuffer();
		t.write("ABCDEF\n\nFOO\n\x1bH\x1b[2J");
		expect(t.toString()).to.be("");
	})
	it("emits a inject event", function(done) {
		var t = newTermBuffer();
		t.on('inject', function(char) {
			done();
		});
		t.inject("A");
	})
});
