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
	})
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
});
