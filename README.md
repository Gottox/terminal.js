# terminal.js

Terminal.js is a rendering engine for vt100-like terminals.
It is written from scratch and supports most commonly used escape sequences.

[![Build Status](https://travis-ci.org/Gottox/terminal.js.png)](https://travis-ci.org/Gottox/terminal.js)

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
    buffer.write("first test\n");

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

- escapeWrite
- write
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

## Support

We're on freenode: #terminal.js
