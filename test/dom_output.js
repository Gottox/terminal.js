describe("DomOutput", function() {
	var TermState = Terminal.TermState;
	var DomOutput = Terminal.output.DomOutput;

	jsdom();
	function newTerminal(w, h) {
		var t = new TermState({rows:h, columns:w}), tw = new Terminal(t);
		t.setMode("crlf", true);
		return tw;
	}

	it("should draw only one cursor in column one (#110)", function() {
		var t = newTerminal();
		var body = document.body;
		body.innerHTML = "<pre id=term></pre>";
		var container = document.getElementById("term");

		t.dom(container);
		// Set cursor
		t.write("fff\r\nfff\x1b[H");
		t.write("\x1b[2d");

		// check if there are more than one cursors (lastIndex != firstIndex)
		var cursorIdentifier = "background: #00ff00; color: #ffffff;";
		var firstIndex = container.innerHTML.indexOf(cursorIdentifier);
		var lastIndex = container.innerHTML.lastIndexOf(cursorIdentifier);
		expect(firstIndex).to.be(lastIndex);
	});
});
