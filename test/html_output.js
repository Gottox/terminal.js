describe('HtmlOutput', function() {
	var TermBuffer = Terminal.TermBuffer;
	var TermWriter = Terminal.TermWriter;
	var HtmlOutput = Terminal.output.HtmlOutput;

	function newTermWriter(w, h) {
		var t = new TermBuffer(w, h), tw = new TermWriter(t);
		t.setMode('crlf', true);
		return tw;
	}

	it("basic write test", function() {
		var t = newTermWriter();
		var r = new HtmlOutput(t.buffer);
		t.write("\x1b[31mHello\x1b[m World");

		expect(r.toString()).to.contain('<span style="color:#ff0000;">Hello</span><span style="">');
	});
});
