var Terminal = terminal.Terminal
describe('Terminal', function() {
	it("creates Terminal", function() {
		expect(new Terminal()).to.have.property('buffer')
		expect(new Terminal().toString()).to.be("")
	});
	it("writes to Terminal", function() {
		var t = new Terminal();
		t.write("Hello World");
		expect(t.toString()).to.be("Hello World");
		t.write("\nHello World");
		expect(t.toString()).to.be("Hello World\nHello World");
		//t.write("\n");
		//expect(t.toString()).to.be("Hello World\nHello World\n");
	});
	it("breaks lines", function() {
		var t = new Terminal(10, 10);
		t.write("1234567890abcdefghi")
		expect(t.toString()).to.be("1234567890\nabcdefghi")
		t.write("j")
		expect(t.toString()).to.be("1234567890\nabcdefghij")
	})
	it("scrolls", function() {
		var t = new Terminal(10, 10);
		t.write("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20")
		expect(t.toString()).to.be("11\n12\n13\n14\n15\n16\n17\n18\n19\n20")
	})
	it("moves cursor up", function() {
		var t = new Terminal();
		t.write("Test\nTest");
		t.mvCur(0, -1);
		t.write("!");
		expect(t.toString()).to.be("Test!\nTest")

		t = new Terminal();
		t.write("Test\nTest");
		t.mvCur(0, -2);
		t.write("!");
		expect(t.toString()).to.be("Test!\nTest")
	})
	it("moves cursor down", function() {
		var t = new Terminal();
		t.write("Test\nTest");
		t.mvCur(0,1);
		t.write("!");
		expect(t.toString()).to.be("Test\nTest\n    !")
	})
	it("moves cursor left", function() {
		var t = new Terminal();
		t.write("Tesd");
		t.mvCur(-1,0);
		t.write("t");

		expect(t.toString()).to.be("Test")
		t.mvCur(-100,0)
		t.write("Hello World")
		expect(t.toString()).to.be("Hello World");
	});
	it("moves cursor right", function() {
		var t = new Terminal();
		t.write("Tes");
		t.mvCur(1,0);
		t.write("t");
		expect(t.toString()).to.be("Tes t")
	})
});
