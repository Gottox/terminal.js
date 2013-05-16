var TermBuffer = terminal.TermBuffer;
var TermWriter = terminal.TermWriter;
var PlainRenderer = terminal.renderer.PlainRenderer;
function newTermWriter(w, h) {
	var t = new TermBuffer(w, h), tw = new TermWriter(t);
	t.setMode('crlf', true);
	return tw;
}
describe('PlainRenderer', function() {
	it("basic write test", function() {
		var t = newTermWriter();
		var r = new PlainRenderer(t.buffer);
		t.write("Hello\ntest");
		expect(r.toString()).to.be('Hello\ntest');
	});
});
