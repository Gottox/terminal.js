# terminal.js

Terminal.js is a rendering engine for vt100-like terminals.
It is written from scratch and supports most commonly used escape sequences.

## Benefits

- it can be used both in nodejs and as a javascript library in the browser
- it avoids any dependencies like pty, html outputting etc so you can provide your own
- clean separation of different escape codes
- has a test framework

## Usage
### Terminal Usage

    var Terminal = require('terminal.js').Terminal;
    var term = new Terminal(80,24);
    term.mod.crlf = true
    term.write("first test\n");

### Termdiff Usage

    var Terminal = require('terminal.js').Terminal;
    var Termdiff = require('terminal.js').TermDiff;
    var term = new Terminal();
    var termDiff = new TermDiff(term);
    term.write("first test");
    console.log(termDiff.diff());

## Terminal Functions

- createChar
- createLine
- getLine

- write
- escapeWrite
- inject
- lineFeed
- mvCur : moves to relative coordinates
- setCur : move to absolute coordinates
- mvTab
- tabSet
- tabClear
- saveCursor
- restoreCursor
- deleteCharacters
- eraseCharacters
- setScrollRegion
- eraseInDisplay
- eraseInLine
- deleteLines
- resetAttr
- chAttr
- insertBlanks
- resize
- insertLines
- toString
- setLed
- scroll
- eventToKey


## Terminal Object structure

- width: width of the terminal ``80``
- height: height of the terminal ``24``

- leds: ``{ '1': false, '2': false, '3': false, '4': false }``
- mode: ``{ cursor: true, appKeypad: false, wrap: true, insert: false, crlf: false, mousebtn: false, mousemtn: false, reverse: false, graphic: false }``

  term.mode.crlf = true make a linefeed go the next line AND to the beginning of the line

- cursor: ``{ x: 14, y: 1 }``
- savedCursor: remembered location of previous cursor - `{ x: 0, y: 0 }``

- defaultBuffer: when a new terminal gets created it has this buffer ``[]``:w
- altBuffer: alternate to Default Buffer (for use in Xterm)
- escapeBuffer: TODO - defaults to ``null``

- tabs: ``[]``
- scrollRegion: ``[ 0, 24 ]``
- scrollBack: ``[]``

- lineAttr: ``{ doubletop: false, doublebottom: false, doublewidth: false }``
- defaultAttr: `` { fg: 15, bg: 0, bold: false, underline: false, blink: false, inverse: false }``

- buffer: `` [ ...arrays of lines... ]``
- line: ``line: [ ... arrays of chars... ] , attr:{}, changed: true }``
- char: ``{ chr: 'r', attr: { fg: 15, bg: 0, bold: false, underline: false, blink: false, inverse: false } }``

Note: a line can be sparse => ``line: [ , , , , , , { ...char .... } ]``

## Terminal Diff structure

    { '0': { act: '+', rm: 0, line: [ ... ], attr: {}, changed: true }, # If the line was added
      '1': { act: 'c', rm: 0, line: [.....], attr: {}, changed: true }, # If the line was changed
      '2': { rm: ... },                                                 # If the line was removed

### Alternatives

## Remarks

- we should clone the defaultBuffer instead of equalling it (see reset function)
- attrCommited? always after changr of attr?
- this.attr = this.defaultAttr (again it should copy it not equal the object)
- Termdiff.diff() - should it not be an array instead of a hash?
