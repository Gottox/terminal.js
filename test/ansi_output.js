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

		//expect(r.toString()).to.be('\u001b[22;23;24;25;27mHello\u001b[0m');
		expect(r.toString()).to.be('\u001b[22;23;24;25;27mHello\u001b[22;23;24;25;7m \u001b[0m');
		t.buffer.setCursor(0,0);
		expect(r.toString()).to.be('\u001b[22;23;24;25;7mH\u001b[22;23;24;25;27mello\u001b[0m');
	});
});
