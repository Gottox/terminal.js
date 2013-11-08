# terminal.js

Terminal.js is a rendering engine for vt100-like terminals.
It is written from scratch and supports most commonly used escape sequences.

[![Build Status](https://travis-ci.org/Gottox/terminal.js.png)](https://travis-ci.org/Gottox/terminal.js)

## Benefits

- it can be used both in nodejs and as a javascript library in the browser
- it avoids any dependencies like pty, html outputting etc so you can provide your own
- it does not use an html dom to store it's state, this makes it server state compatible
- clean separation of different escape codes
- has a test framework

## Usage
### TermWriter Usage

    var TermWriter = require('terminal').TermWriter;
    var TermBuffer = require('terminal').TermBuffer;

    var buffer = new TermBuffer(80,24);
    var terminal = new TermWriter(termBuffer);
    terminal.write("first test\n");
    // termWriter.buffer is accessible

### TermBuffer Usage

    var TermBuffer = require('terminal').TermBuffer;
    var buffer = new TermBuffer(80,24);
    buffer.inject("first test\n");

### TermDiff Usage

    var TermDiff = require('terminal').TermDiff;
    var TermBuffer = require('terminal').TermBuffer;

    var buffer1 = new TermBuffer(80,24);
    var buffer2 = new TermBuffer(80,24);

    var terminal1 = new TermWriter(buffer1);
    var terminal2 = new TermWriter(buffer2);

    terminal1.write("test me");
    var diff = new TermDiff(terminal1.buffer,terminal2.buffer);

    diff.apply(terminal1);

## TermBuffer Functions

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


## TermBuffer Object structure

## TermDiff structure

    diff = {
      changes: [
        { l: 0, '.': { // On line0 replace the line
          str: 'test', // With string test
          attr{
          '0': { fg: null, bg:null, bold:false , underline: false, blink: false, inverse: false }, // Change Attributes on Pos0
          '2': { fg: null, bg:null, bold:false , underline: false, blink: false, inverse: true  }  // Change Attributes on Pos2
          }
        },
        { l: 1, '+': { // Online 1 add a line
          str: 'test', // With String test
          attr{
          '0': { fg: null, bg:null, bold:false , underline: false, blink: false, inverse: false }, // Change Attributes on Pos0
          '2': { fg: null, bg:null, bold:false , underline: false, blink: false, inverse: true  }  // Change Attributes on Pos2
          }
        },
        { l: 2, '-': 3 }, // On line2 remove 3 lines
      ],
      cursor: [ { from: { 'x': 0, 'y':10 }, to: { 'x': 0, 'y':12 } } ],
      savedcursor: [ { from: { 'x': 0, 'y':10 }, to: { 'x': 0, 'y':12 } } ],
      size: [ { from: { 'height': 80, 'width':24 }, to: { 'height': 30, 'width':12 } } ],
      scrollregion: [ {from: [ 0, 10 ], to: [ 0, 12 ] } ],
      modes: [ { 'graphic': true }, { 'insert': false } ],
      tabs: [ { from: [] , to: [ 1 ] }]
    }

## Alternatives & Related
### Jquery/Server side:

- headless-terminal - <https://github.com/dtinth/headless-terminal>
- tty.js - <https://github.com/chjj/tty.js/> 
- jquery terminal emulator  - <https://github.com/jcubic/jquery.terminal>
- tty.js - <https://github.com/jondistad/tty.js>
- screen-buffer - <https://github.com/dtinth/screen-buffer>
- Terminal.js - <https://github.com/chenxiaoqino/Terminal.js>
- terminal.js - <https://github.com/wayneashleyberry/terminal.js>
- Terminal.js - <https://github.com/Tehnix/Terminal.js>
- Js-terminal - <https://github.com/realslimkarthik/js-terminal>

### Expose local shell in a browser:

- ttycast.js - <https://github.com/dtinth/ttycast>
- js.terminal - <https://github.com/svewag/js.terminal>
- Node-terminal-shark - <https://github.com/raadad/node-terminal-shark>

### Simulate a pseudo shell in browser:

- terminal.js is a dead simple JavaScript library for emulating a shell environment - <https://github.com/eosterberg/terminaljs>
- terminal.js - <https://github.com/wayneashleyberry/terminal.js>
- JUIx - <http://www.masswerk.at/jsuix/>
- Termlib - <http://www.masswerk.at/termlib/>

### Reference docs for vt100, csi , ... codes

- <http://www.vt100.net/docs/vt510-rm/contents>
- <http://www8.cs.umu.se/~isak/snippets/vt100.txt>
- <http://linux.about.com/library/cmd/blcmdl4_console_codes.htm>

## Remarks

- we should clone the defaultBuffer instead of equalling it (see reset function)
- attrCommited? always after changr of attr?
- this.attr = this.defaultAttr (again it should copy it not equal the object)
- Termdiff.diff() - should it not be an array instead of a hash?
