var TermBuffer = Terminal.TermBuffer;
var TermWriter = Terminal.TermWriter;
var AnsiOutput = Terminal.output.AnsiOutput;
function newTermWriter(w, h) {
	var t = new TermBuffer(w, h), tw = new TermWriter(t);
	t.setMode('crlf', true);
	return tw;
}
describe('AnsiOutput', function() {
	it("basic write test", function() {
		var t = newTermWriter();
		var r = new AnsiOutput(t.buffer);
		t.write("Hello");

		expect(r.toString()).to.be('\u001b[22;24;25;27mHello\u001b[0m');
	});
});
