describe('HtmlOutput', function() {
	var TermBuffer = Terminal.TermBuffer;
	var HtmlOutput = Terminal.output.HtmlOutput;

	function newTerminal(w, h) {
		var t = new TermBuffer(w, h), tw = new Terminal(t);
		t.setMode('crlf', true);
		return tw;
	}

	it("basic write test", function() {
		var t = newTerminal();
		var r = new HtmlOutput(t.buffer);
		t.write("\x1b[31mHello\x1b[m World");

		expect(r.toString()).to.contain('<span style="color:#cc0000;">Hello</span><span style="">');
	});
});
