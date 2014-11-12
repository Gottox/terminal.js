var TermBuffer = Terminal.TermBuffer;
var PlainOutput = Terminal.output.PlainOutput;
function newTerminal(w, h) {
	var t = new Terminal({columns: w, rows: h});
	t.buffer.setMode('crlf', true);
	return t;
}
describe('PlainOutput', function() {
	it("basic write test", function() {
		var t = newTerminal(80,4);
		var r = new PlainOutput(t.buffer);
		t.write("Hello\ntest");
		expect(r.toString()).to.be('Hello\ntest\n\n\n');
	});
});
