var TermBuffer = terminal.TermBuffer;
var TermWriter = terminal.TermWriter;
function newTermWriter(w, h) {
	var t = new TermBuffer(w, h), tw = new TermWriter(t);
	t.mode.crlf = true;
	return tw;
}
describe('TermWriter', function() {
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
		t.write("\x1b[?1046h");
		expect(t.toString()).to.be("");
	});
	it("shouldn't print non printables", function() {
		var t = newTermWriter();
		t.write("\x0e\x0f");
		expect(t.toString()).to.be("");
	});
	it("should clear", function() {
		var t = newTermWriter();
		t.write("ABCDEF\n\nFOO\n\x1b[H\x1b[2J");
		expect(t.toString()).to.be("");
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
	it("should reverse the terminal correctly", function() {
		var t = newTermWriter(80,24);
		expect(t.buffer.mode.reverse).to.be(false);
		t.write("\x1b[?5hABCDEFGH");
		expect(t.buffer.mode.reverse).to.be(true);
		t.write("\x1b[?5l");
		expect(t.buffer.mode.reverse).to.be(false);
		expect(t.toString()).to.be("ABCDEFGH");
	});
	/* TODO reenable this test
	it("should reset (RIS)", function() {
		var t1 = new TermBuffer(80,24);
		var t2 = new TermBuffer(80,24);
		//change mode, led and write a char
		t1.write("\x1b[?5h\x1b[1qABCD\x1bc");
		expect(t1.diff(t2).length).to.be(0);
	});*/
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
});
