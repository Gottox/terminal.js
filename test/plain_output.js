var TermBuffer = Terminal.TermBuffer;
var TermWriter = Terminal.TermWriter;
var PlainOutput = Terminal.output.PlainOutput;
function newTermWriter(w, h) {
	var t = new TermBuffer(w, h), tw = new TermWriter(t);
	t.setMode('crlf', true);
	return tw;
}
describe('PlainOutput', function() {
	it("basic write test", function() {
		var t = newTermWriter(80,4);
		var r = new PlainOutput(t.buffer);
		t.write("Hello\ntest");
		expect(r.toString()).to.be('Hello\ntest\n\n\n');
	});
});
