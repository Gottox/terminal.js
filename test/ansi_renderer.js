var TermBuffer = terminal.TermBuffer;
var TermWriter = terminal.TermWriter;
var AnsiRenderer = terminal.renderer.AnsiRenderer;
function newTermWriter(w, h) {
	var t = new TermBuffer(w, h), tw = new TermWriter(t);
	t.setMode('crlf', true);
	return tw;
}
describe('AnsiRenderer', function() {
	it("basic write test", function() {
		var t = newTermWriter();
		var r = new AnsiRenderer(t.buffer);
		t.write("Hello");

		expect(r.toString()).to.be('\u001b[22;24;25;27mHello');
	});
});
