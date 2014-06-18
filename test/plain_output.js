var TermBuffer = Terminal.TermBuffer;
var PlainOutput = Terminal.output.PlainOutput;
function newTerminal(w, h) {
	var t = new TermBuffer(w, h), tw = new Terminal(t);
	t.setMode('crlf', true);
	return tw;
}
describe('PlainOutput', function() {
	it("basic write test", function() {
		var t = newTerminal(80,4);
		var r = new PlainOutput(t.buffer);
		t.write("Hello\ntest");
		expect(r.toString()).to.be('Hello\ntest\n\n\n');
	});
});
