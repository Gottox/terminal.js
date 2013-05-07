(function(e){if("function"==typeof bootstrap)bootstrap("terminal",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeTerminal=e}else"undefined"!=typeof window?window.terminal=e():global.terminal=e()})(function(){var define,ses,bootstrap,module,exports;
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
exports.TermBuffer = require("./lib/term_buffer.js").TermBuffer
exports.Terminal = exports.TermBuffer; // legacy 
exports.TermDiff = require("./lib/term_diff.js").TermDiff

},{"./lib/term_buffer.js":2,"./lib/term_diff.js":3}],4:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":5}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":6}],3:[function(require,module,exports){
(function(){var util = require('./util');

function TermDiff(terminal) {
	this.cursorX = -1;
	this.cursorLine = null;
	this.oldBuffer = [];
	this.terminal = terminal;
}

TermDiff.prototype = {
	diff: function() {
		var diff = {}
		var i = 0, j = 0;
		var emptyLine = {line:[]};
		var deleted = 0;
		var t = this.terminal

		// Check if the cursor has changed position
		if(this.cursorX !== t.cursor.x || t.buffer[t.cursor.y] !== this.cursorLine) {
			if(this.cursorLine) {
				this.cursorLine.changed = true;
				if(this.cursorLine.line[this.cursorX])
					delete this.cursorLine.line[this.cursorX].cursor;
			}

			this.cursorLine = t.getLine(t.cursor.y);
			this.cursorX = t.cursor.x;
			this.cursorLine.changed = true;
			if(!this.cursorLine.line[t.cursor.x])
				this.cursorLine.line[t.cursor.x] = {};
			this.cursorLine.line[t.cursor.x].cursor = t.mode.cursor;
		}


		// Compare the oldBuffer and current Buffer
		// a) first run through the lines that are available in both buffers (smallest number of lines of each buffer)
		//    to see if they have lines in common of differ
		for(; i < Math.min(t.buffer.length, this.oldBuffer.length); i++, j++) {
			var line = t.buffer[i] || emptyLine
			  , oldLine = this.oldBuffer[j] || emptyLine

			// We could do smarter and instead of complete lines, see what the lines have in common
			/* var oldInNew = util.indexOf(t.buffer, oldLine)
			  , newInOld = util.indexOf(this.oldBuffer, line)

			if(oldInNew === -1 && newInOld !== -1) {
				deleted = newInOld - i;
				j += deleted;
				oldLine = this.oldBuffer[j] || emptyLine
				oldInNew = util.indexOf(t.buffer, oldLine)
			}

			if(line.changed || newInOld === -1) {
				if(newInOld === -1) {
					diff[i] = {act: '+', line: line, rm: deleted};
					j--;
				}
				else {
					diff[i] = {act: 'c', line: line, rm: deleted};
				}
			}
			else if(deleted !== 0)
				diff[i] = {rm: deleted};*/

			// If the line changed(cursor) or the line is different from the oldline
			if(line.changed || line !== oldLine) {
				diff[i] = util.extend({act: 'c', rm: deleted}, line);
			}
			
			deleted = 0;
			delete line.changed
		}

		// For all the 'extra' lines check to see if they were added or deleted
		deleted = this.oldBuffer.length - j
		for(; i < t.buffer.length; i++){
			diff[i] = util.extend({act: '+', rm: deleted}, t.buffer[i]);
			if(t.buffer[i])
				delete t.buffer[i].changed
			deleted = 0;
		}
		if(deleted !== 0)
			diff[i] = {rm: deleted};

		this.oldBuffer = t.buffer.slice(0);
		return diff;
	}
}

exports.TermDiff = TermDiff;

})()
},{"./util":7}],2:[function(require,module,exports){
var inherits = require('util').inherits;
var util = require('./util');
var ansi = require('./ansi');
var csi = require('./csi');
var character = require('./character');
var EventEmitter = require('events').EventEmitter;

var escapeHandler = {}
escapeHandler[csi.chr] = csi.exec
escapeHandler[ansi.chr] = ansi.exec

var graphics = {
	'`': '\u25C6',
	'a': '\u2592',
	'b': '\u2409',
	'c': '\u240C',
	'd': '\u240D',
	'e': '\u240A',
	'f': '\u00B0',
	'g': '\u00B1',
	'h': '\u2424',
	'i': '\u240B',
	'j': '\u2518',
	'k': '\u2510',
	'l': '\u250C',
	'm': '\u2514',
	'n': '\u253C',
	'o': '\u23BA',
	'p': '\u23BB',
	'q': '\u2500',
	'r': '\u23BC',
	's': '\u23BD',
	't': '\u251C',
	'u': '\u2524',
	'v': '\u2534',
	'w': '\u252C',
	'x': '\u2502',
	'y': '\u2264',
	'z': '\u2265',
	'{': '\u03C0',
	'|': '\u2260',
	'}': '\u00A3',
	'~': '\u00B7',
};


function TermBuffer(width, height, attr) {
	EventEmitter.call(this);
	this.scrollBack = [];
	this.width = width || 80;
	this.height = height || 24;
	this.leds = [!!0,!!0,!!0,!!0];
	this.lineAttr = {
		doubletop: false,
		doublebottom: false,
		doublewidth: false
	};

	this.defaultAttr = util.extend({
		fg: 15,
		bg: 0,
		bold: false,
		underline: false,
		blink: false,
		inverse: false,
	}, attr || {});

	// Reset all on first use
	this.reset();
}
inherits(TermBuffer, EventEmitter);

TermBuffer.prototype.reset = function() {
	this.defaultBuffer = [];
	this.altBuffer = [];
	this.buffer = this.defaultBuffer.slice(0);
	this.mode = {
		cursor: true,
		appKeypad: false,
		wrap: true,
		insert: false,
		crlf: false,
		mousebtn: false,
		mousemtn: false,
		reverse: false,
		graphic: false
	}
	this.attr = this.defaultAttr;
	this.attrCommited = true;
	this.cursor = {x:0,y:0};
	this.savedCursor = {x:0,y:0};
	this.tabs = [];
	this.scrollRegion = [0, this.height];
	this.escapeBuffer = null;
}

TermBuffer.prototype.createChar = function(chr) {
	this.attrCommited = true;
	if(this.mode.graphic)
		chr = graphics[chr] !== undefined ? graphics[chr] : chr;
	return {
		chr: chr === undefined ? ' ' : chr,
		attr: this.attr,
	};
}

// TODO - this should read the (Default)LineAttr
TermBuffer.prototype.createLine = function() {
	return {line: [], attr: {}};
}

TermBuffer.prototype.getLine = function() {
	var c = this.cursor;
	return this.buffer[c.y] || (this.buffer[c.y] = this.createLine());
}

TermBuffer.prototype.write = function(data, encoding) {
	// Convert Buffers to strings
	if(typeof data !== 'string')
		data = data.toString(encoding);
	// if there's an unfinished escape sequence
	if(this.escapeBuffer !== null) {
		data = this.escapeBuffer + data;
		this.escapeBuffer = null
	}
	for(var i = 0; i < data.length && i >= 0; i++) {
		if(data[i] === '\x1b') { // ESCAPE
			var len = this.escapeWrite(data.substr(i));
			if(len == 0)
				return true;
			i += len - 1;
		}
		else {
			character.exec(this, data[i]);
		}
	}
	return true;
}

TermBuffer.prototype.escapeWrite = function(data) {
	var cmd = data[1];
	var handler = (escapeHandler[data[1]] || escapeHandler[""])
	var len = 0;
	if(cmd === undefined || (len = handler(this, data)) == 0)
		this.escapeBuffer = data;
	return len;
}

TermBuffer.prototype.inject = function(str) {
	this.emit('inject', str);
	if(this.mode.insert)
		this.insertBlanks(str.length);
	var line = this.getLine();
	line.changed = true;
	var c = this.cursor;
	for(var i = 0; i < str.length; i++) {
		if(c.x >= this.width) {
			if(this.mode.wrap) {
				this.lineFeed();
				this.setCur({x:0});
				line = this.getLine();
				line.soft = true;
				line.changed = true;
			}
			else {
				this.setCur({x:this.width-1})
			}
		}
		line.line[c.x] = this.createChar(str[i]);
		this.mvCur(1,0);
	}
}

TermBuffer.prototype.lineFeed = function() {
	this.mvCur(0,1);
	if(this.mode.crlf)
		this.setCur({x:0});
}

TermBuffer.prototype.mvCur = function(x, y) {
	return this.setCur({
		x: this.cursor.x + parseInt(x),
		y: this.cursor.y + parseInt(y)
	});
}

TermBuffer.prototype.setCur = function(cur) {
	var inbound = 0;
	if(cur.x < 0)
		cur.x = 0;
	else if(cur.x > this.width)
		cur.x = this.width;
	else
		inbound++;

	if(cur.y < 0)
		cur.y = 0;
	else if(cur.y >= this.scrollRegion[1]) {
		this.scroll('down', this.scrollRegion[1] - cur.y + 1);
		cur.y = this.scrollRegion[1] - 1;
	}
	else
		inbound++;

	if(cur.x !== undefined)
		this.cursor.x = cur.x;
	if(cur.y !== undefined)
		this.cursor.y = cur.y;

	return inbound === 2;
}

TermBuffer.prototype.mvTab = function(n) {
	var nx = this.cursor.x;
	var tabMax = this.tabs[this.tabs.length - 1] || 0;
	var positive = n > 0;
	n = Math.abs(n);
	while(n != 0 && nx > 0 && nx < this.width-1) {
		nx += positive ? 1 : -1;
		if(util.indexOf(this.tabs, nx) != -1 || (nx > tabMax && nx % 8 == 0))
			n--;
	}
	this.setCur({x: nx});
}

TermBuffer.prototype.tabSet = function(pos) {
	// Set the default to current cursor if no tab position is specified
	if(pos === undefined) {
		pos = this.cursor.x;
	}
	// Only add the tab position if it is not there already
	if (this.tabs.indexOf(pos) > 0) {
		this.tabs.push(pos);
		this.tabs.sort();
	}
}

TermBuffer.prototype.tabUnset = function(pos) {
	var index = this.tabs.indexOf(pos);
	if (index > 0) {
		this.tabs.splice(index,1);
	}
}

// Sets the tabs according the tabs provided
// Removes previous set tabs if they are not specified
TermBuffer.prototype.setTabs = function(tabs) {
	// Save a copy of the oldtabs
	var oldTabs = this.tabs.slice(0);

	for(var i=0 ; i < tabs.length; i++) {
		var pos = oldTabs.indexOf(tabs[i]);
		var found = (pos > 0)
		if (found) {
			// Remove it from the OldTabs to handle
			oldTabs.splice(pos,1);
			// Remove it from the tabs to handle
			tabs.splice(i,1);
		} else {
			// Set the tab
			this.tabSet(tabs[i]);
		}
	}

	// Now remove the remainder Oldtabs
	for(var i=0 ; i < oldTabs.length; i++) {
		this.tabUnset(oldTabs[i]);
	}
}

TermBuffer.prototype.tabClear = function(n) {
	switch(n || 'current') {
		case 'current':
		case 0:
			for(var i = this.tabs.length - 1; i >= 0; i--) {
				if(this.tabs[i] < this.cursor.x) {
					this.tabs.splice(i, 1);
					break;
				}
			}
			break;
		case 'all':
		case 3:
			this.tabs = [];
			break;
	}
}

TermBuffer.prototype.saveCursor = function() {
	this.savedCursor.x = this.cursor.x;
	this.savedCursor.y = this.cursor.y;
}

TermBuffer.prototype.setSavedCursor = function(cursor) {
	this.savedCursor.x = cursor.x;
	this.savedCursor.y = cursor.y;
}

TermBuffer.prototype.restoreCursor = function() {
	this.setCur(this.savedCursor);
}

TermBuffer.prototype.deleteCharacters = function(n) {
	var line = this.getLine().line;
	line.splice(this.cursor.x, n || 1);
}

TermBuffer.prototype.eraseCharacters = function(n) {
	this.deleteCharacters(n);
	this.insertBlanks(n);
}

TermBuffer.prototype.setScrollRegion = function(n, m) {
	this.scrollRegion[0] = n;
	this.scrollRegion[1] = m;
}

TermBuffer.prototype.eraseInDisplay = function(n) {
	switch(n || 0) {
		case 0:
			this.buffer.splice(this.cursor.y);
			break;
		case 1:
			var args = [0, this.cursor.y-1, Array(this.cursor.y-1)];
			Array.prototype.splice.apply(this.buffer, args);
			break;
		case 2:
			this.buffer.splice(0);
			return;
	}
	return this.eraseInLine(n);
}

TermBuffer.prototype.eraseInLine = function(n) {
	var line = this.getLine();
	line.changed = true;
	switch(n || 0) {
		case 0:
			line.line.splice(this.cursor.x);
			break;
		case 1:
			var args = new Array(this.cursor.x+1);
			args.unshift(0, this.cursor.x+1);
			Array.prototype.splice.apply(line.line, args);
			while(line.line[line.line.length - 1] !== undefined)
				line.line.pop();
			break;
		case 2:
			line.line.splice(0);
			break;
	}
	return this;
}

TermBuffer.prototype.addLine = function(line, row) {
	// Simple deep object copy
	var newLine =  JSON.parse(JSON.stringify(line))
	this.buffer.splice(row,0,newLine);
}

TermBuffer.prototype.replaceLine = function(line, row) {
	// TODO We could be more intelligent and just replace characters
	this.deleteLines(1,row);
	this.addLine(line, row);
}

TermBuffer.prototype.deleteLines = function(n, startRow, bla) {
	var row = startRow;
	if (row === undefined) {
		row = this.cursor.y
	}
	this.buffer.splice(row, n || 1);
}

TermBuffer.prototype.resetAttr = function() {
	if(arguments.length === 0) {
		this.attr = this.defaultAttr;
		this.attrCommited = true;
	}
	for(var i = 0; i < arguments.length; i++)
		this.chAttr(arguments[i], this.defaultAttr[arguments[i]]);
}

TermBuffer.prototype.chAttr = function(name, value) {
	if(this.attrCommited == true) {
		this.attr = util.extend({}, this.attr);
		delete this.attr.str
	}
	this.attr[name] = value;
	this.attrCommited = false;
}


TermBuffer.prototype.insertBlanks = function(n) {
	var line = this.getLine();
	line.changed = true;
	var args = Array(parseInt(n));
	args.unshift(this.cursor.x,0);
	Array.prototype.splice.apply(line.line, args);
	line.line.splice(this.width);
}

TermBuffer.prototype.resize = function(w, h) {
	this.buffer.splice(h);
	for(var i = 0; i < this.buffer.length; i++) {
		this.buffer[i].line.splice(w);
		this.buffer[i].changed = true;
	}
	this.width = w;
	this.height = h;
	this.setCur({
		x: this.cursor.x,
		y: this.cursor.y
	});
}

TermBuffer.prototype.insertLines = function(n, pos) {
	if(pos === undefined)
		pos = this.cursor.y;
	if(pos < this.scrollRegion[0] || pos > this.scrollRegion[1])
		return;
	var tail = this.buffer.length - this.scrollRegion[1];
	var args = new Array(n);
	args.unshift(pos, 0);
	console.log(args);
	Array.prototype.splice.apply(this.buffer, args);
	this.buffer.splice(this.scrollRegion[1], this.buffer.length - this.scrollRegion[1] - tail);
}

TermBuffer.prototype.toString = function(locateCursor) {
	var ret = []
	if(locateCursor) {
		ret.push(Array(this.cursor.x+3).join(' ') + 'v')
	}
	for(var i = 0; i < this.buffer.length; i++) {
		var line = []
		if(locateCursor) {
			line.push((this.buffer[i] && this.buffer[i].changed) ? "*" : " ")
			line.push(i == this.cursor.y ? ">" : " ")
		}
		if(this.buffer[i])
			for(var j = 0; j < this.buffer[i].line.length; j++) {
				line.push(this.buffer[i].line[j] ? (this.buffer[i].line[j].chr || ' ') : ' ');
			}
			while(line[line.length-1] === ' ') line.pop();
			ret.push(line.join(''));
	}
	if(locateCursor)
		ret.push(Array(this.cursor.x+3).join(' ') + '^');
	return ret.join('\n');
}

TermBuffer.prototype.setLed = function(n,value) {
	if(n == 0)
		this.leds = [!!0,!!0,!!0,!!0];
	else
	if (value === undefined) {
		this.leds[n] = true;
	} else {
		this.leds[n] = value;
	}
	//this.metachanged();
	return this;
}

TermBuffer.prototype.setLeds = function(leds) {
	for(var i in leds) {
		this.setLed(i,leds[i]);
	}
}

TermBuffer.prototype.setModes = function(mode) {
	for(var i in mode) {
		this.mode[i] = mode[i];
	}
},

TermBuffer.prototype.setDefaultAttr = function(attrs) {
	for(var i in attrs) {
		this.defaultAttrs[i] = attrs[i];
	}
}

TermBuffer.prototype.setLineAttr = function(attrs) {
	for(var i in attrs) {
		this.lineAttr[i] = attrs[i];
	}
}

TermBuffer.prototype.scroll = function(dir, lines) {
	if(lines === undefined)
		lines = 1;
	// TODO hacky!
	for(var i = 0; i < lines; i++) {
		this.buffer.splice(this.scrollRegion[dir === 'up' ? 0 : 1], 0, this.createLine());
		if(this.height >= this.scrollRegion[dir === 'up' ? 1 : 0])
			this.buffer.splice(this.scrollRegion[dir === 'up' ? 1 : 0], 1);
	}
}

TermBuffer.prototype.eventToKey = function(event) {
	var kpd = this.mode.appKeypad;
	switch(event.which) {
		case 38: // up
			return kpd ? "\x1bOA" : "\x1b[A";
		case 40: // down
			return kpd ? "\x1bOB" : "\x1b[B";
		case 39: // right
			return kpd ? "\x1bOC" : "\x1b[C";
		case 37: // left
			return kpd ? "\x1bOD" : "\x1b[D";
		case 8:
			return "\x08";
		case 9:
			return "\t";
		default:
			return String.fromCharCode(event.which);
	}
}

// Generates a diff between this.term and OtherTerm
// if this diff is applied to this.term it results in the same as OtherTerm
TermBuffer.prototype.diff = function(otherTerm) {

	var thisBuffer = this.buffer;
	var otherBuffer = otherTerm.buffer;
	var emptyLine = { line: [] };
	var diff = [];


	// Change of saveCursor
	if (this.savedCursor.x !== otherTerm.savedCursor.x || this.savedCursor.y !== otherTerm.savedCursor.y) {
		diff.push({action: 'change', type: 'savedCursor', data: { x: otherTerm.savedCursor.x , y: otherTerm.savedCursor.y}});
	}

	// Change in size
	if (this.width !== otherTerm.width || this.height !== otherTerm.height) {
		diff.push({action: 'change' , type: 'size', data: { width: otherTerm.width , height: otherTerm.height}});
	}

	// Change of Leds
	var ledChange = {};
	for (var key in this.leds) {
		if (this.leds[key] !== otherTerm.leds[key]) {
			ledChange[key] = otherTerm.leds[key]
		}
	}
	if (Object.keys(ledChange).length > 0) { diff.push({action: 'change', type: 'led', data: ledChange}) }

	// Change of Mode
	var modeChange = {};
	for (var key in this.mode) {
		if (this.mode[key] !== otherTerm.mode[key]) {
			modeChange[key] = otherTerm.mode[key]
		}
	}
	if (Object.keys(modeChange).length > 0) { diff.push({action: 'change', type: 'mode', data: modeChange}) }

	// Change of DefaultAttr
	var defaultAttrChange = {};
	for (var key in this.defaultAttr) {
		if (this.defaultAttr[key] !== otherTerm.defaultAttr[key]) {
			defaultAttrChange[key] = otherTerm.defaultAttr[key]
		}
	}
	if (Object.keys(defaultAttrChange).length > 0) { diff.push({action: 'change', type: 'defaultAttr', data: defaultAttrChange}) }

	// Change of (Default)LineAttr
	var lineAttrChange = {};
	for (var key in this.lineAttr) {
		if (this.lineAttr[key] !== otherTerm.lineAttr[key]) {
			lineAtrrChange[key] = otherTerm.lineAttr[key]
		}
	}
	if (Object.keys(lineAttrChange).length > 0) { diff.push({action: 'change' , type: 'lineAttr', data: lineAttrChange}) }

	// Change of scrollRegion
	if (this.scrollRegion[0] !== otherTerm.scrollRegion[0] || this.scrollRegion[1] !== otherTerm.scrollRegion[1]) {
		diff.push({action: 'change' , type: 'scrollRegion', data: [ otherTerm.scrollRegion[0] , otherTerm.scrollRegion[1] ]} );
	}

	// Change of Tabs
	if (this.tabs.join(',') !== otherTerm.tabs.join(',')) {
		diff.push({action: 'change' , type: 'tabs', data: otherTerm.tabs.slice(0)});
	}

	// TODO Detect Change of DefaultBuffer
	// TODO - don't extend a line, clone the array of the line

	// We have more lines than the other TermBuffer
	if (thisBuffer.length > otherBuffer.length) {
		// We need to remove the extra lines
		var linesToDelete = thisBuffer.length - otherBuffer.length
		diff.push({action: 'remove', type: 'line' , data: { lineNumber: otherBuffer.length , lines: linesToDelete}});
	}

	// Go through the common set of lines
	// TODO sync the scrollbuffer
	for(var i=0; i < Math.min(thisBuffer.length, otherBuffer.length) ; i++) {
		var thisLine  = thisBuffer[i]  || emptyLine;
		var otherLine = otherBuffer[i] || emptyLine;

		// TODO We can be smarter by only diffing parts of the line
		// This !== of two lines will always happen, it is not a good test
		var isDifferent = (JSON.stringify(thisLine) !== JSON.stringify(otherLine));
		if (isDifferent) {
			diff.push({action: 'replace', type: 'line', data: {lineNumber: i , line: otherLine}});
		}
	}

	// We have less lines than the other TermBuffer
	if (thisBuffer.length < otherBuffer.length) {
		// We need to add the extra lines
		for(var i = thisBuffer.length ; i < otherBuffer.length; i++) {
			var otherLine = otherBuffer[i] || emptyLine;
			diff.push({action: 'add', type: 'line',  data: {lineNumber: i, line: otherLine}});
		}
	}

	// We need to do this as the last patch (to make sure all lines have been created)
	// Change of Cursor
	if (this.cursor.x !== otherTerm.cursor.x || this.cursor.y !== otherTerm.cursor.y) {
		diff.push({action: 'change', type: 'cursor', data: { x: otherTerm.cursor.x , y: otherTerm.cursor.y}});
	}

	return (diff);
}

TermBuffer.prototype.apply = function(diff) {

	// Iterate over all entries in the patch
	for(var i in diff) {

		var d = diff[i].data;
		switch(diff[i].type) {
			case 'cursor':
				this.setCur(d);
				break;
			case 'savedCursor':
				this.setSavedCursor(d);
				break;
			case 'size':
				this.resize(d.width, d.height);
				break;
			case 'led':
				this.setLeds(d);
				break;
			case 'mode':
				this.setModes(d);
				break;
			case 'defaultAttr':
				this.setDefaultAttr(d);
				break;
			case 'lineAttr':
				this.setLineAttr(d);
				break;
			case 'scrollRegion':
				this.setScrollRegion(d[0], d[1]);
				break;
			case 'tab':
				this.setTabs(d);
				break;
			case 'line':
				switch (diff[i].action) {
					case 'replace':
						this.replaceLine(d.line, d.lineNumber);
						break;
					case 'add':
						this.addLine(d.line, d.lineNumber);
						break;
					case 'remove':
						this.deleteLines(d.lines, d.lineNumber);
						break
				}
				break;
		}
	}
}

module.exports.TermBuffer = TermBuffer;

},{"util":4,"events":5,"./util":7,"./ansi":8,"./character":9,"./csi":10}],9:[function(require,module,exports){
exports.exec = function(term, chr) {
	switch(chr) {
		case '\x07': // BELL
			// TODO
			break;
		case '\x08': // BACKSPACE
			term.mvCur(-1, 0);
			break;
		case '\x09': // TAB
			term.mvTab(1);
			break;
		case '\n': // LINEFEED
			term.lineFeed();
			break;
		case '\x0d': // CARRIAGE RETURN
			term.setCur({x:0 });
			break;
		case '\x7f': // DELETE
			term.deleteCharacters(1);
			break;
		case '\x88': // TABSET
			term.setTab();
			break;
		case '\x0e':	/* SO */
		case '\x0f':	/* SI */
			break;
		default:
			term.inject(chr);
	}
}

},{}],8:[function(require,module,exports){
exports.chr = "";
exports.exec = function(term, data) {
	switch(data[1]) {
	case '(':
		if(data[2] === undefined)
			return 0;
		term.mode.graphic = data[2] === '0';
		return 3;
	case ')':
	case '*':
	case '+':
		if(data[2] === undefined)
			return 0;
		term.mode.graphic = false;
		return 3;
	case 'c':
		term.reset();
		return 2;
	case 'D':
		term.inject('\x84');
		return 2;
	case 'E':
		if(!term.mvCur(0, 1))
			term.insertLines(1);
		return 2;
	case 'H':
		term.tabSet();
		return 2;
	case 'M':
		if(term.cursor.y == term.scrollRegion[0])
			term.scroll('up');
		else
			term.mvCur(0, -1)
		return 2;
	case 'N':
		term.write('\x8e');
		return 2;
	case 'O':
		term.write('\x8f');
		return 2;
	case 'P':
		term.write('\x90');
		return 2;
	case 'V':
		term.write('\x96');
		return 2;
	case 'W':
		term.write('\x97');
		return 2;
	case 'X':
		term.write('\x98');
		return 2;
	case 'Z':
		term.write('\x9a');
		return 2;
	case '[':
		term.write('\x9b');
		return 2;
	case '\\':
		term.write('\x9c');
		return 2;
	case ']':
		term.write('\x9d');
		return 2;
	case '^':
		term.write('\x9e');
		return 2;
	case '_':
		term.write('\x9f');
		return 2;
	case '#':
		if(data[1] === undefined)
			return 0;
		var line = term.getLine();
		switch(data[1]) {
		case '3':
			line.attr.doubletop = true;
			line.changed = true;
			break;
		case '4':
			line.attr.doublebottom = true;
			line.changed = true;
			break;
		case '5':
			line.attr.doublewidth = false;
			line.changed = true;
			break;
		case '6':
			line.attr.doublewidth = true;
			line.changed = true;
			break;
		}
		return 3;
	case 'g': //Visual Bell
		return 2;
	case '=':
		return 2;
	case '<':
		return 2;
	case '>':
		return 2;
	default:
		console.log("unknown escape character " + data[1]);
		return 1;
	}
}

},{}],7:[function(require,module,exports){
exports.extend = function(o){
	for(var i = 1; i < arguments.length; i++)
		for(var key in arguments[i])
			o[key] = arguments[i][key];
	return o;
}

exports.indexOf = function(arr, elem) {
	if(arr.indexOf)
		return arr.indexOf(elem);
	else if(elem !== undefined)
		for(var i = 0; i < arr.length; i++)
			if(arr[i] === elem) return i;
	return -1;
}

},{}],10:[function(require,module,exports){
var sgr = require('./sgr');

var CSI_PATTERN = /^\x1b\[([?!>]?)([0-9;]*)([@A-Za-z`]?)/;

function parseCsi(data) {
	var match = CSI_PATTERN.exec(data)
	if(match === null)
		return null
	return {
		args: match[2] === "" ? [] : match[2].split(';'),
		mod: match[1],
		cmd: match[3],
		offset: match[0].length
	};
}

exports.chr = "[";
exports.exec = function(term, data) {
	var match = parseCsi(data);
	if(match === null || (match.offset != data.length && match.cmd === '')) {
		console.log("Garbaged CSI: " + (match ? data.slice(0, match.offset+1) : "unknown"));
		// Consume escape character.
		return 1;
	}
	var n = +match.args[0], m = +match.args[1];
	switch(match.cmd) {
	case '': // Unfinished sequence.
		return 0;
	case '@': // ICH
		term.insertBlanks(n || 1);
		break;
	case 'A': // CUU
		term.mvCur(0, -n || 1);
		break;
	case 'B': // CUD
		term.mvCur(0, n || 1);
		break;
	case 'C': // CUF
	case 'a': // HPR
		term.mvCur(n || 1, 0);
		break;
	case 'D': // CUB
		term.mvCur(-n || 1, 0);
		break;
	case 'E': // CNL
		term.mvCur(0, n || 1).setCur({x: 0});
		break;
	case 'F': // CPL
		term.mvCur(0, -n || 1).setCur({x: 0});
		break;
	case '`': // HPA
	case 'G': // CHA
		term.setCur({x: (n || 1) - 1});
		break;
	case 'f': // HVP
	case 'H': // CUP
		term.setCur({y: (n || 1) - 1, x: (m || 1) - 1});
		break;
	case 'I': // CHT
		term.mvTab(n || 1);
		break;
	case 'J': // ED / DECSED
		term.eraseInDisplay(n);
		break;
	case 'K': // EL / DECSEL
		term.eraseInLine(n);
		break;
	case 'L': // IL
		term.insertLines(n || 1);
		break;
	case 'M':
		term.deleteLines(n || 1);
		break;
	case 'P': // DCH
		term.deleteCharacters(n || 1);
		break;
	case 'S': // SU
		term.scroll('up');
		break
	case 'T': // SD / Initiate highlight mouse tracking
		if(match.args === 0)
			term.scroll('down');
		else
			console.log('Not implemented ' + match.cmd);
		break;
	case 'X': // ECH
		term.eraseCharacters(n || 1);
		break;
	case 'Z': // CBT
		term.mvTab(-(n || 1));
		break;
	case 'b': // REP
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	case 'd': // VPA
		term.setCur({y:(n || 1) - 1});
		break;
	case 'g': // TBC
		term.tabClear(n);
		break;
	case 'h': // SM / DECSET
		for(var i = 0; i < match.args.length; i++)
			setMode(term, match.mod, match.args[i], true);
		break;
	case 'i': // MC
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	case 'l': // RM / DECRST
		for(var i = 0; i < match.args.length; i++)
			setMode(term, match.mod, match.args[i], false);
		break;
	case 'm': // SGR
		sgr.exec(term, match.args);
		break;
	case 'n': // DSR
	case 'p': // pointerMode
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	case 'q': // DECLL
		term.setLed(n);
		break;
	case 'r': // DECSTBM / Restore DEC Private Mode Values
		if(match.args.length == 2)
			term.setScrollRegion(n-1, m);
		//else
		//	TODO
		break;
	case 's': // Save Cursor
		if(match.args.length == 0)
			term.curSave();
		//else
		//	TODO
		break;
	case 't':
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	case 'u': // Restore Cursor
		if(match.args.length == 0)
			term.curRest();
		//else
		//	TODO
		break;
	case 'c': // DA
		if(typeof term.answer === 'function')
			term.answer(term, "\x1b>0;95;c");
		else
			console.log('device attributes requested. please implement term.answer = function(terminal, msg) { ... }');
		break;
	case 'v': // DECCRA
	case 'w': // DECEFR
	case 'x': // DECREQTPARM / DECSACE / DECFRA
	case 'y': // DECRQCRA
	case 'z': // DECELR / DECERA
	case '{': // DECSLE / DECSERA
	case '|': // DECRQLP
	case '}': // DECIC
	case '~': // DECDC
		// TODO
		console.log('Not implemented ' + match.cmd);
		break;
	default:
		console.log("Unknown CSI-command '"+match.cmd+"'");
	}
	return match.offset;
}

var modes = {
	'4': 'insert',
	'?1': 'appKeypad',
	'?12': 'cursorBlink',
	'?1000': 'mousebtn',
	'?1002': 'mousemtn',
	'?20': 'crlf',
	'?25': 'cursor',
	'?5': 'reverse',
	'?7': 'wrap',
}

function setMode(term, mod, n, v) {
	var identifier = mod+n;
	switch(identifier) {
	case '?1047':
		term.altBuffer = [];
		// No break here.
	case '?47':
		term.buffer = v ? term.altBuffer : term.defaultBuffer;
		break;
	case '?1048':
		if(v)
			term.saveCursor();
		else
			term.restoreCursor();
		break;
	case '?1049':
		setMode(term, mod, '1048', v);
		setMode(term, mod, '1047', v);
		if(v)
			term.setCur({x:0,y:0});
		break;
	case '?4': // Ignore
		break;
	default:
		if(modes[identifier])
			term.mode[modes[identifier]] = v;
		else
			console.log("Unknown mode: " + identifier);
	}
}

},{"./sgr":11}],11:[function(require,module,exports){
var util = require('./util');

exports.exec = function(term, sgr) {
	if(sgr.length === 0)
		term.resetAttr();
	for(var i = 0; i < sgr.length; i++) {
		switch(parseInt(sgr[i])) {
		case 0:
			term.resetAttr();
			break;
		case 1:
			term.chAttr('bold', true);
			break;
		case 3:
			term.chAttr('italic', true);
			break;
		case 4:
			term.chAttr('underline', true);
			break;
		case 5:
		case 6:
			term.chAttr('blink', true);
			break;
		case 7:
			if(!term.attr.inverse) {
				term.chAttr('inverse', true);
				var tmp = term.attr.fg;
				term.chAttr('fg', term.attr.bg);
				term.chAttr('bg', tmp);
			}
			break;
		case 22:
			term.resetAttr('bold');
			break;
		case 23:
			term.chAttr('italic', false);
			break;
		case 24:
			term.chAttr('underline', false);
			break;
		case 25:
			term.chAttr('blink', false);
			break
		case 27:
			if(term.attr.inverse) {
				term.chAttr('inverse', false);
				var tmp = term.attr.fg;
				term.chAttr('fg', term.attr.bg);
				term.chAttr('bg', tmp);
			}
			break;
		case 38:
			if(sgr[i+1] == 5)
				term.chAttr('fg', -sgr[i+=2]);
			break
		case 39:
			term.resetAttr('fg');
			break;
		case 48:
			if(sgr[i+1] == 5)
				term.chAttr('bg', -sgr[i+=2]);
			break;
		case 49:
			term.resetAttr('bg');
			break;
		default:
			if(sgr[i] >= 30 && sgr[i] <= 37)
				term.chAttr('fg', sgr[i] - 30);
			else if(sgr[i] >= 40 && sgr[i] <= 47)
				term.chAttr('bg', sgr[i] - 40);
			else if(sgr[i] >= 90 && sgr[i] <= 99)
				term.chAttr('fg', sgr[i] - 90 + 8);
			else if(sgr[i] >= 100 && sgr[i] <= 109)
				term.chAttr('bg', sgr[i] - 100 + 8);
			else
				console.log("Unkown sgr command '"+sgr[i]+"'");
		}
	}
}

},{"./util":7}]},{},[1])(1)
});
;