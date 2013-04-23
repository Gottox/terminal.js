var Terminal = terminal.Terminal
function newTerminal(w, h) {
	var t = new Terminal(w, h);
	t.mode.crlf = true;
	return t;
}
describe('Terminal', function() {
	it("creates Terminal", function() {
		expect(newTerminal()).to.have.property('buffer')
		expect(newTerminal().toString()).to.be("")
	});
	it("writes to Terminal", function() {
		var t = newTerminal();
		t.write("Hello World");
		expect(t.toString()).to.be("Hello World");
		t.write("\nHello World");
		expect(t.toString()).to.be("Hello World\nHello World");
		//t.write("\n");
		//expect(t.toString()).to.be("Hello World\nHello World\n");
	});
	it("breaks lines", function() {
		var t = newTerminal(10, 10);
		t.write("1234567890abcdefghi")
		expect(t.toString()).to.be("1234567890\nabcdefghi")
		t.write("j")
		expect(t.toString()).to.be("1234567890\nabcdefghij")
	})
	it("scrolls", function() {
		var t = newTerminal(10, 10);
		t.write("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20")
		expect(t.toString()).to.be("11\n12\n13\n14\n15\n16\n17\n18\n19\n20")
	})
	it("moves cursor up", function() {
		var t = newTerminal();
		t.write("Test\nTest");
		t.mvCur(0, -1);
		t.write("!");
		expect(t.toString()).to.be("Test!\nTest")

		t = newTerminal();
		t.write("Test\nTest");
		t.mvCur(0, -2);
		t.write("!");
		expect(t.toString()).to.be("Test!\nTest")
	})
	it("moves cursor down", function() {
		var t = newTerminal();
		t.write("Test\nTest");
		t.mvCur(0,1);
		t.write("!");
		expect(t.toString()).to.be("Test\nTest\n    !")
	})
	it("moves cursor left", function() {
		var t = newTerminal();
		t.write("Tesd");
		t.mvCur(-1,0);
		t.write("t");

		expect(t.toString()).to.be("Test")
		t.mvCur(-100,0)
		t.write("Hello World")
		expect(t.toString()).to.be("Hello World");
	});
	it("moves cursor right", function() {
		var t = newTerminal();
		t.write("Tes");
		t.mvCur(1,0);
		t.write("t");
		expect(t.toString()).to.be("Tes t")
	});
	it("deletes lines", function() {
		var t = newTerminal();
		t.write("1\n2\n3\n4\x1b[2H\x1b[2M");
		expect(t.toString()).to.be("1\n4");
	});
	it("shouldn't print non printables", function() {
		var t = newTerminal();
		t.write("\x0e\x0f");
		expect(t.toString()).to.be("");
	});
	it("should clear", function() {
		var t = newTerminal();
		t.write("ABCDEF\n\nFOO\n\x1bH\x1b[2J");
		expect(t.toString()).to.be("");
	})
	it("emits a inject event", function(done) {
		var t = newTerminal();
    t.on('inject', function(char) {
      done();
    });
		t.inject("A");
	})
});
