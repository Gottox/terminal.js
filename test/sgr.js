var TermBuffer = terminal.TermBuffer;
var TermWriter = terminal.TermWriter;
function newTermWriter(w, h) {
	var t = new TermBuffer(w, h), tw = new TermWriter(t);
	t.mode.crlf = true;
	return tw;
}
describe('TermWriter SGI', function() {
	it("resets attributes", function() {
		var t = newTermWriter();
		t.write("\x1b[1mb\x1b[mn");
		expect(t.buffer.buffer[0].line[0].chr).to.be('b');
		expect(t.buffer.buffer[0].line[0].attr.bold).to.be(true);
		expect(t.buffer.buffer[0].line[1].chr).to.be('n');
		expect(t.buffer.buffer[0].line[1].attr.bold).to.be(false);
	})
	it("sets bold", function() {
		var t = newTermWriter();
		t.write("\x1b[1mb");
		expect(t.buffer.buffer[0].line[0].chr).to.be('b');
	});
});
