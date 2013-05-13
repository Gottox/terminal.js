var TermBuffer = terminal.TermBuffer;
var TermWriter = terminal.TermWriter;
function newTermWriter(w, h) {
	var t = new TermBuffer(w, h), tw = new TermWriter(t);
	t.setMode('crlf', true);
	return tw;
}
describe('TermWriter SGI', function() {
	it("resets attributes", function() {
		var t = newTermWriter();
		t.write("\x1b[1mb\x1b[mn");
		expect(t.buffer._buffer.str[0][0]).to.be('b');
		expect(t.buffer._buffer.attr[0][0].bold).to.be(true);
		expect(t.buffer._buffer.str[0][1]).to.be('n');
		expect(t.buffer._buffer.attr[0][1].bold).to.be(false);
	});
	it("sets bold", function() {
		var t = newTermWriter();
		t.write("\x1b[1mb");
		expect(t.buffer._buffer.str[0][0]).to.be('b');
		expect(t.buffer._buffer.attr[0][0].bold).to.be(true);
	});
});
