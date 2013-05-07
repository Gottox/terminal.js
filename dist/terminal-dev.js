require=(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({"terminal.js":[function(require,module,exports){
module.exports=require('n7cH9t');
},{}],"n7cH9t":[function(require,module,exports){
exports.TermBuffer = require("./lib/term_buffer.js").TermBuffer
exports.Terminal = exports.TermBuffer; // legacy 
exports.TermDiff = require("./lib/term_diff.js").TermDiff

},{"./lib/term_buffer.js":1,"./lib/term_diff.js":2}],3:[function(require,module,exports){
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

},{"events":4}],5:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
},{"__browserify_process":5}],1:[function(require,module,exports){
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

},{"util":3,"events":4,"./ansi":6,"./util":7,"./csi":8,"./character":9}],2:[function(require,module,exports){
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
},{"./util":7}],6:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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
			term.deleteChar(1);
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

},{"./sgr":10}],10:[function(require,module,exports){
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

},{"./util":7}]},{},[])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcGF0cmljay9kZXYvdGVybWluYWwuanMvaW5kZXguanMiLCIvVXNlcnMvcGF0cmljay9kZXYvdGVybWluYWwuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9idWlsdGluL3V0aWwuanMiLCIvVXNlcnMvcGF0cmljay9kZXYvdGVybWluYWwuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL3BhdHJpY2svZGV2L3Rlcm1pbmFsLmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvYnVpbHRpbi9ldmVudHMuanMiLCIvVXNlcnMvcGF0cmljay9kZXYvdGVybWluYWwuanMvbGliL3Rlcm1fYnVmZmVyLmpzIiwiL1VzZXJzL3BhdHJpY2svZGV2L3Rlcm1pbmFsLmpzL2xpYi90ZXJtX2RpZmYuanMiLCIvVXNlcnMvcGF0cmljay9kZXYvdGVybWluYWwuanMvbGliL2Fuc2kuanMiLCIvVXNlcnMvcGF0cmljay9kZXYvdGVybWluYWwuanMvbGliL3V0aWwuanMiLCIvVXNlcnMvcGF0cmljay9kZXYvdGVybWluYWwuanMvbGliL2NoYXJhY3Rlci5qcyIsIi9Vc2Vycy9wYXRyaWNrL2Rldi90ZXJtaW5hbC5qcy9saWIvY3NpLmpzIiwiL1VzZXJzL3BhdHJpY2svZGV2L3Rlcm1pbmFsLmpzL2xpYi9zZ3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4cUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnRzLlRlcm1CdWZmZXIgPSByZXF1aXJlKFwiLi9saWIvdGVybV9idWZmZXIuanNcIikuVGVybUJ1ZmZlclxuZXhwb3J0cy5UZXJtaW5hbCA9IGV4cG9ydHMuVGVybUJ1ZmZlcjsgLy8gbGVnYWN5IFxuZXhwb3J0cy5UZXJtRGlmZiA9IHJlcXVpcmUoXCIuL2xpYi90ZXJtX2RpZmYuanNcIikuVGVybURpZmZcbiIsInZhciBldmVudHMgPSByZXF1aXJlKCdldmVudHMnKTtcblxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcbmV4cG9ydHMuaXNEYXRlID0gZnVuY3Rpb24ob2JqKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IERhdGVdJ307XG5leHBvcnRzLmlzUmVnRXhwID0gZnVuY3Rpb24ob2JqKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IFJlZ0V4cF0nfTtcblxuXG5leHBvcnRzLnByaW50ID0gZnVuY3Rpb24gKCkge307XG5leHBvcnRzLnB1dHMgPSBmdW5jdGlvbiAoKSB7fTtcbmV4cG9ydHMuZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuXG5leHBvcnRzLmluc3BlY3QgPSBmdW5jdGlvbihvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMpIHtcbiAgdmFyIHNlZW4gPSBbXTtcblxuICB2YXIgc3R5bGl6ZSA9IGZ1bmN0aW9uKHN0ciwgc3R5bGVUeXBlKSB7XG4gICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG4gICAgdmFyIHN0eWxlcyA9XG4gICAgICAgIHsgJ2JvbGQnIDogWzEsIDIyXSxcbiAgICAgICAgICAnaXRhbGljJyA6IFszLCAyM10sXG4gICAgICAgICAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAgICAgICAgICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICAgICAgICAgJ3doaXRlJyA6IFszNywgMzldLFxuICAgICAgICAgICdncmV5JyA6IFs5MCwgMzldLFxuICAgICAgICAgICdibGFjaycgOiBbMzAsIDM5XSxcbiAgICAgICAgICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgICAgICAgICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgICAgICAgICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICAgICAgICAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICAgICAgICAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgICAgICAgICAneWVsbG93JyA6IFszMywgMzldIH07XG5cbiAgICB2YXIgc3R5bGUgPVxuICAgICAgICB7ICdzcGVjaWFsJzogJ2N5YW4nLFxuICAgICAgICAgICdudW1iZXInOiAnYmx1ZScsXG4gICAgICAgICAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgICAgICAgICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAgICAgICAgICdudWxsJzogJ2JvbGQnLFxuICAgICAgICAgICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAgICAgICAgICdkYXRlJzogJ21hZ2VudGEnLFxuICAgICAgICAgIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICAgICAgICAgJ3JlZ2V4cCc6ICdyZWQnIH1bc3R5bGVUeXBlXTtcblxuICAgIGlmIChzdHlsZSkge1xuICAgICAgcmV0dXJuICdcXDAzM1snICsgc3R5bGVzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICAgJ1xcMDMzWycgKyBzdHlsZXNbc3R5bGVdWzFdICsgJ20nO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgfTtcbiAgaWYgKCEgY29sb3JzKSB7XG4gICAgc3R5bGl6ZSA9IGZ1bmN0aW9uKHN0ciwgc3R5bGVUeXBlKSB7IHJldHVybiBzdHI7IH07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXQodmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAgIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLmluc3BlY3QgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICAgIHZhbHVlICE9PSBleHBvcnRzICYmXG4gICAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMpO1xuICAgIH1cblxuICAgIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgICAgIHJldHVybiBzdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG5cbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgICAgIHJldHVybiBzdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuXG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG5cbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAgIH1cbiAgICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG4gICAgfVxuXG4gICAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICAgIHZhciB2aXNpYmxlX2tleXMgPSBPYmplY3Rfa2V5cyh2YWx1ZSk7XG4gICAgdmFyIGtleXMgPSBzaG93SGlkZGVuID8gT2JqZWN0X2dldE93blByb3BlcnR5TmFtZXModmFsdWUpIDogdmlzaWJsZV9rZXlzO1xuXG4gICAgLy8gRnVuY3Rpb25zIHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAncmVnZXhwJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGF0ZXMgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZFxuICAgIGlmIChpc0RhdGUodmFsdWUpICYmIGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gc3R5bGl6ZSh2YWx1ZS50b1VUQ1N0cmluZygpLCAnZGF0ZScpO1xuICAgIH1cblxuICAgIHZhciBiYXNlLCB0eXBlLCBicmFjZXM7XG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBvYmplY3QgdHlwZVxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgdHlwZSA9ICdBcnJheSc7XG4gICAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICAgIH0gZWxzZSB7XG4gICAgICB0eXBlID0gJ09iamVjdCc7XG4gICAgICBicmFjZXMgPSBbJ3snLCAnfSddO1xuICAgIH1cblxuICAgIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICBiYXNlID0gKGlzUmVnRXhwKHZhbHVlKSkgPyAnICcgKyB2YWx1ZSA6ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2UgPSAnJztcbiAgICB9XG5cbiAgICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgYmFzZSA9ICcgJyArIHZhbHVlLnRvVVRDU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgICB9XG5cbiAgICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAncmVnZXhwJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgICB2YXIgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgbmFtZSwgc3RyO1xuICAgICAgaWYgKHZhbHVlLl9fbG9va3VwR2V0dGVyX18pIHtcbiAgICAgICAgaWYgKHZhbHVlLl9fbG9va3VwR2V0dGVyX18oa2V5KSkge1xuICAgICAgICAgIGlmICh2YWx1ZS5fX2xvb2t1cFNldHRlcl9fKGtleSkpIHtcbiAgICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHZhbHVlLl9fbG9va3VwU2V0dGVyX18oa2V5KSkge1xuICAgICAgICAgICAgc3RyID0gc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHZpc2libGVfa2V5cy5pbmRleE9mKGtleSkgPCAwKSB7XG4gICAgICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gICAgICB9XG4gICAgICBpZiAoIXN0cikge1xuICAgICAgICBpZiAoc2Vlbi5pbmRleE9mKHZhbHVlW2tleV0pIDwgMCkge1xuICAgICAgICAgIGlmIChyZWN1cnNlVGltZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh2YWx1ZVtrZXldKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyID0gZm9ybWF0KHZhbHVlW2tleV0sIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdBcnJheScgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cbiAgICAgICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICAgICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICAgICAgbmFtZSA9IHN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgICAgIG5hbWUgPSBzdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG4gICAgfSk7XG5cbiAgICBzZWVuLnBvcCgpO1xuXG4gICAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICAgIG51bUxpbmVzRXN0Kys7XG4gICAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgICByZXR1cm4gcHJldiArIGN1ci5sZW5ndGggKyAxO1xuICAgIH0sIDApO1xuXG4gICAgaWYgKGxlbmd0aCA+IDUwKSB7XG4gICAgICBvdXRwdXQgPSBicmFjZXNbMF0gK1xuICAgICAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICAgICAnICcgK1xuICAgICAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgICAgICcgJyArXG4gICAgICAgICAgICAgICBicmFjZXNbMV07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0ID0gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cbiAgcmV0dXJuIGZvcm1hdChvYmosICh0eXBlb2YgZGVwdGggPT09ICd1bmRlZmluZWQnID8gMiA6IGRlcHRoKSk7XG59O1xuXG5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIGFyIGluc3RhbmNlb2YgQXJyYXkgfHxcbiAgICAgICAgIEFycmF5LmlzQXJyYXkoYXIpIHx8XG4gICAgICAgICAoYXIgJiYgYXIgIT09IE9iamVjdC5wcm90b3R5cGUgJiYgaXNBcnJheShhci5fX3Byb3RvX18pKTtcbn1cblxuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gcmUgaW5zdGFuY2VvZiBSZWdFeHAgfHxcbiAgICAodHlwZW9mIHJlID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocmUpID09PSAnW29iamVjdCBSZWdFeHBdJyk7XG59XG5cblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgaWYgKGQgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKHR5cGVvZiBkICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICB2YXIgcHJvcGVydGllcyA9IERhdGUucHJvdG90eXBlICYmIE9iamVjdF9nZXRPd25Qcm9wZXJ0eU5hbWVzKERhdGUucHJvdG90eXBlKTtcbiAgdmFyIHByb3RvID0gZC5fX3Byb3RvX18gJiYgT2JqZWN0X2dldE93blByb3BlcnR5TmFtZXMoZC5fX3Byb3RvX18pO1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJvdG8pID09PSBKU09OLnN0cmluZ2lmeShwcm9wZXJ0aWVzKTtcbn1cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cbmV4cG9ydHMubG9nID0gZnVuY3Rpb24gKG1zZykge307XG5cbmV4cG9ydHMucHVtcCA9IG51bGw7XG5cbnZhciBPYmplY3Rfa2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgcmVzLnB1c2goa2V5KTtcbiAgICByZXR1cm4gcmVzO1xufTtcblxudmFyIE9iamVjdF9nZXRPd25Qcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHJlcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59O1xuXG52YXIgT2JqZWN0X2NyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvdHlwZSwgcHJvcGVydGllcykge1xuICAgIC8vIGZyb20gZXM1LXNoaW1cbiAgICB2YXIgb2JqZWN0O1xuICAgIGlmIChwcm90b3R5cGUgPT09IG51bGwpIHtcbiAgICAgICAgb2JqZWN0ID0geyAnX19wcm90b19fJyA6IG51bGwgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvdG90eXBlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgICAndHlwZW9mIHByb3RvdHlwZVsnICsgKHR5cGVvZiBwcm90b3R5cGUpICsgJ10gIT0gXFwnb2JqZWN0XFwnJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgVHlwZSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICBUeXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICAgICAgb2JqZWN0ID0gbmV3IFR5cGUoKTtcbiAgICAgICAgb2JqZWN0Ll9fcHJvdG9fXyA9IHByb3RvdHlwZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QuZGVmaW5lUHJvcGVydGllcykge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhvYmplY3QsIHByb3BlcnRpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xufTtcblxuZXhwb3J0cy5pbmhlcml0cyA9IGZ1bmN0aW9uKGN0b3IsIHN1cGVyQ3Rvcikge1xuICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvcjtcbiAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3RfY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbn07XG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICh0eXBlb2YgZiAhPT0gJ3N0cmluZycpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goZXhwb3J0cy5pbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzogcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKXtcbiAgICBpZiAoeCA9PT0gbnVsbCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgZXhwb3J0cy5pbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICBpZiAoZXYuc291cmNlID09PSB3aW5kb3cgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiKGZ1bmN0aW9uKHByb2Nlc3Mpe2lmICghcHJvY2Vzcy5FdmVudEVtaXR0ZXIpIHByb2Nlc3MuRXZlbnRFbWl0dGVyID0gZnVuY3Rpb24gKCkge307XG5cbnZhciBFdmVudEVtaXR0ZXIgPSBleHBvcnRzLkV2ZW50RW1pdHRlciA9IHByb2Nlc3MuRXZlbnRFbWl0dGVyO1xudmFyIGlzQXJyYXkgPSB0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gQXJyYXkuaXNBcnJheVxuICAgIDogZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgfVxuO1xuZnVuY3Rpb24gaW5kZXhPZiAoeHMsIHgpIHtcbiAgICBpZiAoeHMuaW5kZXhPZikgcmV0dXJuIHhzLmluZGV4T2YoeCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoeCA9PT0geHNbaV0pIHJldHVybiBpO1xuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW5cbi8vIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaFxuLy8gaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG4vL1xuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuICB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID0gbjtcbn07XG5cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNBcnJheSh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSlcbiAgICB7XG4gICAgICBpZiAoYXJndW1lbnRzWzFdIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgYXJndW1lbnRzWzFdOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5jYXVnaHQsIHVuc3BlY2lmaWVkICdlcnJvcicgZXZlbnQuXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gZmFsc2U7XG4gIHZhciBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBpZiAoIWhhbmRsZXIpIHJldHVybiBmYWxzZTtcblxuICBpZiAodHlwZW9mIGhhbmRsZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAoaXNBcnJheShoYW5kbGVyKSkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIHZhciBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG4vLyBFdmVudEVtaXR0ZXIgaXMgZGVmaW5lZCBpbiBzcmMvbm9kZV9ldmVudHMuY2Ncbi8vIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCgpIGlzIGFsc28gZGVmaW5lZCB0aGVyZS5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIGxpc3RlbmVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhZGRMaXN0ZW5lciBvbmx5IHRha2VzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xuICB9XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT0gXCJuZXdMaXN0ZW5lcnNcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJzXCIuXG4gIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHtcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgfSBlbHNlIGlmIChpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgICB2YXIgbTtcbiAgICAgIGlmICh0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbSA9IHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtID0gZGVmYXVsdE1heExpc3RlbmVycztcbiAgICAgIH1cblxuICAgICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYub24odHlwZSwgZnVuY3Rpb24gZygpIHtcbiAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgbGlzdGVuZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlbW92ZUxpc3RlbmVyIG9ubHkgdGFrZXMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XG4gIH1cblxuICAvLyBkb2VzIG5vdCB1c2UgbGlzdGVuZXJzKCksIHNvIG5vIHNpZGUgZWZmZWN0IG9mIGNyZWF0aW5nIF9ldmVudHNbdHlwZV1cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzQXJyYXkobGlzdCkpIHtcbiAgICB2YXIgaSA9IGluZGV4T2YobGlzdCwgbGlzdGVuZXIpO1xuICAgIGlmIChpIDwgMCkgcmV0dXJuIHRoaXM7XG4gICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgaWYgKGxpc3QubGVuZ3RoID09IDApXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICB9IGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSA9PT0gbGlzdGVuZXIpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGRvZXMgbm90IHVzZSBsaXN0ZW5lcnMoKSwgc28gbm8gc2lkZSBlZmZlY3Qgb2YgY3JlYXRpbmcgX2V2ZW50c1t0eXBlXVxuICBpZiAodHlwZSAmJiB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW3R5cGVdKSB0aGlzLl9ldmVudHNbdHlwZV0gPSBudWxsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSB0aGlzLl9ldmVudHNbdHlwZV0gPSBbXTtcbiAgaWYgKCFpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgfVxuICByZXR1cm4gdGhpcy5fZXZlbnRzW3R5cGVdO1xufTtcblxufSkocmVxdWlyZShcIl9fYnJvd3NlcmlmeV9wcm9jZXNzXCIpKSIsInZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ3V0aWwnKS5pbmhlcml0cztcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgYW5zaSA9IHJlcXVpcmUoJy4vYW5zaScpO1xudmFyIGNzaSA9IHJlcXVpcmUoJy4vY3NpJyk7XG52YXIgY2hhcmFjdGVyID0gcmVxdWlyZSgnLi9jaGFyYWN0ZXInKTtcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG5cbnZhciBlc2NhcGVIYW5kbGVyID0ge31cbmVzY2FwZUhhbmRsZXJbY3NpLmNocl0gPSBjc2kuZXhlY1xuZXNjYXBlSGFuZGxlclthbnNpLmNocl0gPSBhbnNpLmV4ZWNcblxudmFyIGdyYXBoaWNzID0ge1xuXHQnYCc6ICdcXHUyNUM2Jyxcblx0J2EnOiAnXFx1MjU5MicsXG5cdCdiJzogJ1xcdTI0MDknLFxuXHQnYyc6ICdcXHUyNDBDJyxcblx0J2QnOiAnXFx1MjQwRCcsXG5cdCdlJzogJ1xcdTI0MEEnLFxuXHQnZic6ICdcXHUwMEIwJyxcblx0J2cnOiAnXFx1MDBCMScsXG5cdCdoJzogJ1xcdTI0MjQnLFxuXHQnaSc6ICdcXHUyNDBCJyxcblx0J2onOiAnXFx1MjUxOCcsXG5cdCdrJzogJ1xcdTI1MTAnLFxuXHQnbCc6ICdcXHUyNTBDJyxcblx0J20nOiAnXFx1MjUxNCcsXG5cdCduJzogJ1xcdTI1M0MnLFxuXHQnbyc6ICdcXHUyM0JBJyxcblx0J3AnOiAnXFx1MjNCQicsXG5cdCdxJzogJ1xcdTI1MDAnLFxuXHQncic6ICdcXHUyM0JDJyxcblx0J3MnOiAnXFx1MjNCRCcsXG5cdCd0JzogJ1xcdTI1MUMnLFxuXHQndSc6ICdcXHUyNTI0Jyxcblx0J3YnOiAnXFx1MjUzNCcsXG5cdCd3JzogJ1xcdTI1MkMnLFxuXHQneCc6ICdcXHUyNTAyJyxcblx0J3knOiAnXFx1MjI2NCcsXG5cdCd6JzogJ1xcdTIyNjUnLFxuXHQneyc6ICdcXHUwM0MwJyxcblx0J3wnOiAnXFx1MjI2MCcsXG5cdCd9JzogJ1xcdTAwQTMnLFxuXHQnfic6ICdcXHUwMEI3Jyxcbn07XG5cblxuZnVuY3Rpb24gVGVybUJ1ZmZlcih3aWR0aCwgaGVpZ2h0LCBhdHRyKSB7XG5cdEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXHR0aGlzLnNjcm9sbEJhY2sgPSBbXTtcblx0dGhpcy53aWR0aCA9IHdpZHRoIHx8IDgwO1xuXHR0aGlzLmhlaWdodCA9IGhlaWdodCB8fCAyNDtcblx0dGhpcy5sZWRzID0gWyEhMCwhITAsISEwLCEhMF07XG5cdHRoaXMubGluZUF0dHIgPSB7XG5cdFx0ZG91YmxldG9wOiBmYWxzZSxcblx0XHRkb3VibGVib3R0b206IGZhbHNlLFxuXHRcdGRvdWJsZXdpZHRoOiBmYWxzZVxuXHR9O1xuXG5cdHRoaXMuZGVmYXVsdEF0dHIgPSB1dGlsLmV4dGVuZCh7XG5cdFx0Zmc6IDE1LFxuXHRcdGJnOiAwLFxuXHRcdGJvbGQ6IGZhbHNlLFxuXHRcdHVuZGVybGluZTogZmFsc2UsXG5cdFx0Ymxpbms6IGZhbHNlLFxuXHRcdGludmVyc2U6IGZhbHNlLFxuXHR9LCBhdHRyIHx8IHt9KTtcblxuXHQvLyBSZXNldCBhbGwgb24gZmlyc3QgdXNlXG5cdHRoaXMucmVzZXQoKTtcbn1cbmluaGVyaXRzKFRlcm1CdWZmZXIsIEV2ZW50RW1pdHRlcik7XG5cblRlcm1CdWZmZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuZGVmYXVsdEJ1ZmZlciA9IFtdO1xuXHR0aGlzLmFsdEJ1ZmZlciA9IFtdO1xuXHR0aGlzLmJ1ZmZlciA9IHRoaXMuZGVmYXVsdEJ1ZmZlci5zbGljZSgwKTtcblx0dGhpcy5tb2RlID0ge1xuXHRcdGN1cnNvcjogdHJ1ZSxcblx0XHRhcHBLZXlwYWQ6IGZhbHNlLFxuXHRcdHdyYXA6IHRydWUsXG5cdFx0aW5zZXJ0OiBmYWxzZSxcblx0XHRjcmxmOiBmYWxzZSxcblx0XHRtb3VzZWJ0bjogZmFsc2UsXG5cdFx0bW91c2VtdG46IGZhbHNlLFxuXHRcdHJldmVyc2U6IGZhbHNlLFxuXHRcdGdyYXBoaWM6IGZhbHNlXG5cdH1cblx0dGhpcy5hdHRyID0gdGhpcy5kZWZhdWx0QXR0cjtcblx0dGhpcy5hdHRyQ29tbWl0ZWQgPSB0cnVlO1xuXHR0aGlzLmN1cnNvciA9IHt4OjAseTowfTtcblx0dGhpcy5zYXZlZEN1cnNvciA9IHt4OjAseTowfTtcblx0dGhpcy50YWJzID0gW107XG5cdHRoaXMuc2Nyb2xsUmVnaW9uID0gWzAsIHRoaXMuaGVpZ2h0XTtcblx0dGhpcy5lc2NhcGVCdWZmZXIgPSBudWxsO1xufVxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5jcmVhdGVDaGFyID0gZnVuY3Rpb24oY2hyKSB7XG5cdHRoaXMuYXR0ckNvbW1pdGVkID0gdHJ1ZTtcblx0aWYodGhpcy5tb2RlLmdyYXBoaWMpXG5cdFx0Y2hyID0gZ3JhcGhpY3NbY2hyXSAhPT0gdW5kZWZpbmVkID8gZ3JhcGhpY3NbY2hyXSA6IGNocjtcblx0cmV0dXJuIHtcblx0XHRjaHI6IGNociA9PT0gdW5kZWZpbmVkID8gJyAnIDogY2hyLFxuXHRcdGF0dHI6IHRoaXMuYXR0cixcblx0fTtcbn1cblxuLy8gVE9ETyAtIHRoaXMgc2hvdWxkIHJlYWQgdGhlIChEZWZhdWx0KUxpbmVBdHRyXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5jcmVhdGVMaW5lID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7bGluZTogW10sIGF0dHI6IHt9fTtcbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUuZ2V0TGluZSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgYyA9IHRoaXMuY3Vyc29yO1xuXHRyZXR1cm4gdGhpcy5idWZmZXJbYy55XSB8fCAodGhpcy5idWZmZXJbYy55XSA9IHRoaXMuY3JlYXRlTGluZSgpKTtcbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihkYXRhLCBlbmNvZGluZykge1xuXHQvLyBDb252ZXJ0IEJ1ZmZlcnMgdG8gc3RyaW5nc1xuXHRpZih0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpXG5cdFx0ZGF0YSA9IGRhdGEudG9TdHJpbmcoZW5jb2RpbmcpO1xuXHQvLyBpZiB0aGVyZSdzIGFuIHVuZmluaXNoZWQgZXNjYXBlIHNlcXVlbmNlXG5cdGlmKHRoaXMuZXNjYXBlQnVmZmVyICE9PSBudWxsKSB7XG5cdFx0ZGF0YSA9IHRoaXMuZXNjYXBlQnVmZmVyICsgZGF0YTtcblx0XHR0aGlzLmVzY2FwZUJ1ZmZlciA9IG51bGxcblx0fVxuXHRmb3IodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGggJiYgaSA+PSAwOyBpKyspIHtcblx0XHRpZihkYXRhW2ldID09PSAnXFx4MWInKSB7IC8vIEVTQ0FQRVxuXHRcdFx0dmFyIGxlbiA9IHRoaXMuZXNjYXBlV3JpdGUoZGF0YS5zdWJzdHIoaSkpO1xuXHRcdFx0aWYobGVuID09IDApXG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0aSArPSBsZW4gLSAxO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGNoYXJhY3Rlci5leGVjKHRoaXMsIGRhdGFbaV0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUuZXNjYXBlV3JpdGUgPSBmdW5jdGlvbihkYXRhKSB7XG5cdHZhciBjbWQgPSBkYXRhWzFdO1xuXHR2YXIgaGFuZGxlciA9IChlc2NhcGVIYW5kbGVyW2RhdGFbMV1dIHx8IGVzY2FwZUhhbmRsZXJbXCJcIl0pXG5cdHZhciBsZW4gPSAwO1xuXHRpZihjbWQgPT09IHVuZGVmaW5lZCB8fCAobGVuID0gaGFuZGxlcih0aGlzLCBkYXRhKSkgPT0gMClcblx0XHR0aGlzLmVzY2FwZUJ1ZmZlciA9IGRhdGE7XG5cdHJldHVybiBsZW47XG59XG5cblRlcm1CdWZmZXIucHJvdG90eXBlLmluamVjdCA9IGZ1bmN0aW9uKHN0cikge1xuXHR0aGlzLmVtaXQoJ2luamVjdCcsIHN0cik7XG5cdGlmKHRoaXMubW9kZS5pbnNlcnQpXG5cdFx0dGhpcy5pbnNlcnRCbGFua3Moc3RyLmxlbmd0aCk7XG5cdHZhciBsaW5lID0gdGhpcy5nZXRMaW5lKCk7XG5cdGxpbmUuY2hhbmdlZCA9IHRydWU7XG5cdHZhciBjID0gdGhpcy5jdXJzb3I7XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcblx0XHRpZihjLnggPj0gdGhpcy53aWR0aCkge1xuXHRcdFx0aWYodGhpcy5tb2RlLndyYXApIHtcblx0XHRcdFx0dGhpcy5saW5lRmVlZCgpO1xuXHRcdFx0XHR0aGlzLnNldEN1cih7eDowfSk7XG5cdFx0XHRcdGxpbmUgPSB0aGlzLmdldExpbmUoKTtcblx0XHRcdFx0bGluZS5zb2Z0ID0gdHJ1ZTtcblx0XHRcdFx0bGluZS5jaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLnNldEN1cih7eDp0aGlzLndpZHRoLTF9KVxuXHRcdFx0fVxuXHRcdH1cblx0XHRsaW5lLmxpbmVbYy54XSA9IHRoaXMuY3JlYXRlQ2hhcihzdHJbaV0pO1xuXHRcdHRoaXMubXZDdXIoMSwwKTtcblx0fVxufVxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5saW5lRmVlZCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLm12Q3VyKDAsMSk7XG5cdGlmKHRoaXMubW9kZS5jcmxmKVxuXHRcdHRoaXMuc2V0Q3VyKHt4OjB9KTtcbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUubXZDdXIgPSBmdW5jdGlvbih4LCB5KSB7XG5cdHJldHVybiB0aGlzLnNldEN1cih7XG5cdFx0eDogdGhpcy5jdXJzb3IueCArIHBhcnNlSW50KHgpLFxuXHRcdHk6IHRoaXMuY3Vyc29yLnkgKyBwYXJzZUludCh5KVxuXHR9KTtcbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUuc2V0Q3VyID0gZnVuY3Rpb24oY3VyKSB7XG5cdHZhciBpbmJvdW5kID0gMDtcblx0aWYoY3VyLnggPCAwKVxuXHRcdGN1ci54ID0gMDtcblx0ZWxzZSBpZihjdXIueCA+IHRoaXMud2lkdGgpXG5cdFx0Y3VyLnggPSB0aGlzLndpZHRoO1xuXHRlbHNlXG5cdFx0aW5ib3VuZCsrO1xuXG5cdGlmKGN1ci55IDwgMClcblx0XHRjdXIueSA9IDA7XG5cdGVsc2UgaWYoY3VyLnkgPj0gdGhpcy5zY3JvbGxSZWdpb25bMV0pIHtcblx0XHR0aGlzLnNjcm9sbCgnZG93bicsIHRoaXMuc2Nyb2xsUmVnaW9uWzFdIC0gY3VyLnkgKyAxKTtcblx0XHRjdXIueSA9IHRoaXMuc2Nyb2xsUmVnaW9uWzFdIC0gMTtcblx0fVxuXHRlbHNlXG5cdFx0aW5ib3VuZCsrO1xuXG5cdGlmKGN1ci54ICE9PSB1bmRlZmluZWQpXG5cdFx0dGhpcy5jdXJzb3IueCA9IGN1ci54O1xuXHRpZihjdXIueSAhPT0gdW5kZWZpbmVkKVxuXHRcdHRoaXMuY3Vyc29yLnkgPSBjdXIueTtcblxuXHRyZXR1cm4gaW5ib3VuZCA9PT0gMjtcbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUubXZUYWIgPSBmdW5jdGlvbihuKSB7XG5cdHZhciBueCA9IHRoaXMuY3Vyc29yLng7XG5cdHZhciB0YWJNYXggPSB0aGlzLnRhYnNbdGhpcy50YWJzLmxlbmd0aCAtIDFdIHx8IDA7XG5cdHZhciBwb3NpdGl2ZSA9IG4gPiAwO1xuXHRuID0gTWF0aC5hYnMobik7XG5cdHdoaWxlKG4gIT0gMCAmJiBueCA+IDAgJiYgbnggPCB0aGlzLndpZHRoLTEpIHtcblx0XHRueCArPSBwb3NpdGl2ZSA/IDEgOiAtMTtcblx0XHRpZih1dGlsLmluZGV4T2YodGhpcy50YWJzLCBueCkgIT0gLTEgfHwgKG54ID4gdGFiTWF4ICYmIG54ICUgOCA9PSAwKSlcblx0XHRcdG4tLTtcblx0fVxuXHR0aGlzLnNldEN1cih7eDogbnh9KTtcbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUudGFiU2V0ID0gZnVuY3Rpb24ocG9zKSB7XG5cdC8vIFNldCB0aGUgZGVmYXVsdCB0byBjdXJyZW50IGN1cnNvciBpZiBubyB0YWIgcG9zaXRpb24gaXMgc3BlY2lmaWVkXG5cdGlmKHBvcyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cG9zID0gdGhpcy5jdXJzb3IueDtcblx0fVxuXHQvLyBPbmx5IGFkZCB0aGUgdGFiIHBvc2l0aW9uIGlmIGl0IGlzIG5vdCB0aGVyZSBhbHJlYWR5XG5cdGlmICh0aGlzLnRhYnMuaW5kZXhPZihwb3MpID4gMCkge1xuXHRcdHRoaXMudGFicy5wdXNoKHBvcyk7XG5cdFx0dGhpcy50YWJzLnNvcnQoKTtcblx0fVxufVxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS50YWJVbnNldCA9IGZ1bmN0aW9uKHBvcykge1xuXHR2YXIgaW5kZXggPSB0aGlzLnRhYnMuaW5kZXhPZihwb3MpO1xuXHRpZiAoaW5kZXggPiAwKSB7XG5cdFx0dGhpcy50YWJzLnNwbGljZShpbmRleCwxKTtcblx0fVxufVxuXG4vLyBTZXRzIHRoZSB0YWJzIGFjY29yZGluZyB0aGUgdGFicyBwcm92aWRlZFxuLy8gUmVtb3ZlcyBwcmV2aW91cyBzZXQgdGFicyBpZiB0aGV5IGFyZSBub3Qgc3BlY2lmaWVkXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5zZXRUYWJzID0gZnVuY3Rpb24odGFicykge1xuXHQvLyBTYXZlIGEgY29weSBvZiB0aGUgb2xkdGFic1xuXHR2YXIgb2xkVGFicyA9IHRoaXMudGFicy5zbGljZSgwKTtcblxuXHRmb3IodmFyIGk9MCA7IGkgPCB0YWJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHBvcyA9IG9sZFRhYnMuaW5kZXhPZih0YWJzW2ldKTtcblx0XHR2YXIgZm91bmQgPSAocG9zID4gMClcblx0XHRpZiAoZm91bmQpIHtcblx0XHRcdC8vIFJlbW92ZSBpdCBmcm9tIHRoZSBPbGRUYWJzIHRvIGhhbmRsZVxuXHRcdFx0b2xkVGFicy5zcGxpY2UocG9zLDEpO1xuXHRcdFx0Ly8gUmVtb3ZlIGl0IGZyb20gdGhlIHRhYnMgdG8gaGFuZGxlXG5cdFx0XHR0YWJzLnNwbGljZShpLDEpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBTZXQgdGhlIHRhYlxuXHRcdFx0dGhpcy50YWJTZXQodGFic1tpXSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gTm93IHJlbW92ZSB0aGUgcmVtYWluZGVyIE9sZHRhYnNcblx0Zm9yKHZhciBpPTAgOyBpIDwgb2xkVGFicy5sZW5ndGg7IGkrKykge1xuXHRcdHRoaXMudGFiVW5zZXQob2xkVGFic1tpXSk7XG5cdH1cbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUudGFiQ2xlYXIgPSBmdW5jdGlvbihuKSB7XG5cdHN3aXRjaChuIHx8ICdjdXJyZW50Jykge1xuXHRcdGNhc2UgJ2N1cnJlbnQnOlxuXHRcdGNhc2UgMDpcblx0XHRcdGZvcih2YXIgaSA9IHRoaXMudGFicy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0XHRpZih0aGlzLnRhYnNbaV0gPCB0aGlzLmN1cnNvci54KSB7XG5cdFx0XHRcdFx0dGhpcy50YWJzLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnYWxsJzpcblx0XHRjYXNlIDM6XG5cdFx0XHR0aGlzLnRhYnMgPSBbXTtcblx0XHRcdGJyZWFrO1xuXHR9XG59XG5cblRlcm1CdWZmZXIucHJvdG90eXBlLnNhdmVDdXJzb3IgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5zYXZlZEN1cnNvci54ID0gdGhpcy5jdXJzb3IueDtcblx0dGhpcy5zYXZlZEN1cnNvci55ID0gdGhpcy5jdXJzb3IueTtcbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUuc2V0U2F2ZWRDdXJzb3IgPSBmdW5jdGlvbihjdXJzb3IpIHtcblx0dGhpcy5zYXZlZEN1cnNvci54ID0gY3Vyc29yLng7XG5cdHRoaXMuc2F2ZWRDdXJzb3IueSA9IGN1cnNvci55O1xufVxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5yZXN0b3JlQ3Vyc29yID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuc2V0Q3VyKHRoaXMuc2F2ZWRDdXJzb3IpO1xufVxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5kZWxldGVDaGFyYWN0ZXJzID0gZnVuY3Rpb24obikge1xuXHR2YXIgbGluZSA9IHRoaXMuZ2V0TGluZSgpLmxpbmU7XG5cdGxpbmUuc3BsaWNlKHRoaXMuY3Vyc29yLngsIG4gfHwgMSk7XG59XG5cblRlcm1CdWZmZXIucHJvdG90eXBlLmVyYXNlQ2hhcmFjdGVycyA9IGZ1bmN0aW9uKG4pIHtcblx0dGhpcy5kZWxldGVDaGFyYWN0ZXJzKG4pO1xuXHR0aGlzLmluc2VydEJsYW5rcyhuKTtcbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUuc2V0U2Nyb2xsUmVnaW9uID0gZnVuY3Rpb24obiwgbSkge1xuXHR0aGlzLnNjcm9sbFJlZ2lvblswXSA9IG47XG5cdHRoaXMuc2Nyb2xsUmVnaW9uWzFdID0gbTtcbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUuZXJhc2VJbkRpc3BsYXkgPSBmdW5jdGlvbihuKSB7XG5cdHN3aXRjaChuIHx8IDApIHtcblx0XHRjYXNlIDA6XG5cdFx0XHR0aGlzLmJ1ZmZlci5zcGxpY2UodGhpcy5jdXJzb3IueSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDE6XG5cdFx0XHR2YXIgYXJncyA9IFswLCB0aGlzLmN1cnNvci55LTEsIEFycmF5KHRoaXMuY3Vyc29yLnktMSldO1xuXHRcdFx0QXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseSh0aGlzLmJ1ZmZlciwgYXJncyk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDI6XG5cdFx0XHR0aGlzLmJ1ZmZlci5zcGxpY2UoMCk7XG5cdFx0XHRyZXR1cm47XG5cdH1cblx0cmV0dXJuIHRoaXMuZXJhc2VJbkxpbmUobik7XG59XG5cblRlcm1CdWZmZXIucHJvdG90eXBlLmVyYXNlSW5MaW5lID0gZnVuY3Rpb24obikge1xuXHR2YXIgbGluZSA9IHRoaXMuZ2V0TGluZSgpO1xuXHRsaW5lLmNoYW5nZWQgPSB0cnVlO1xuXHRzd2l0Y2gobiB8fCAwKSB7XG5cdFx0Y2FzZSAwOlxuXHRcdFx0bGluZS5saW5lLnNwbGljZSh0aGlzLmN1cnNvci54KTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMTpcblx0XHRcdHZhciBhcmdzID0gbmV3IEFycmF5KHRoaXMuY3Vyc29yLngrMSk7XG5cdFx0XHRhcmdzLnVuc2hpZnQoMCwgdGhpcy5jdXJzb3IueCsxKTtcblx0XHRcdEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkobGluZS5saW5lLCBhcmdzKTtcblx0XHRcdHdoaWxlKGxpbmUubGluZVtsaW5lLmxpbmUubGVuZ3RoIC0gMV0gIT09IHVuZGVmaW5lZClcblx0XHRcdFx0bGluZS5saW5lLnBvcCgpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAyOlxuXHRcdFx0bGluZS5saW5lLnNwbGljZSgwKTtcblx0XHRcdGJyZWFrO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufVxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5hZGRMaW5lID0gZnVuY3Rpb24obGluZSwgcm93KSB7XG5cdC8vIFNpbXBsZSBkZWVwIG9iamVjdCBjb3B5XG5cdHZhciBuZXdMaW5lID0gIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobGluZSkpXG5cdHRoaXMuYnVmZmVyLnNwbGljZShyb3csMCxuZXdMaW5lKTtcbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUucmVwbGFjZUxpbmUgPSBmdW5jdGlvbihsaW5lLCByb3cpIHtcblx0Ly8gVE9ETyBXZSBjb3VsZCBiZSBtb3JlIGludGVsbGlnZW50IGFuZCBqdXN0IHJlcGxhY2UgY2hhcmFjdGVyc1xuXHR0aGlzLmRlbGV0ZUxpbmVzKDEscm93KTtcblx0dGhpcy5hZGRMaW5lKGxpbmUsIHJvdyk7XG59XG5cblRlcm1CdWZmZXIucHJvdG90eXBlLmRlbGV0ZUxpbmVzID0gZnVuY3Rpb24obiwgc3RhcnRSb3csIGJsYSkge1xuXHR2YXIgcm93ID0gc3RhcnRSb3c7XG5cdGlmIChyb3cgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJvdyA9IHRoaXMuY3Vyc29yLnlcblx0fVxuXHR0aGlzLmJ1ZmZlci5zcGxpY2Uocm93LCBuIHx8IDEpO1xufVxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5yZXNldEF0dHIgPSBmdW5jdGlvbigpIHtcblx0aWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuXHRcdHRoaXMuYXR0ciA9IHRoaXMuZGVmYXVsdEF0dHI7XG5cdFx0dGhpcy5hdHRyQ29tbWl0ZWQgPSB0cnVlO1xuXHR9XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXG5cdFx0dGhpcy5jaEF0dHIoYXJndW1lbnRzW2ldLCB0aGlzLmRlZmF1bHRBdHRyW2FyZ3VtZW50c1tpXV0pO1xufVxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5jaEF0dHIgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuXHRpZih0aGlzLmF0dHJDb21taXRlZCA9PSB0cnVlKSB7XG5cdFx0dGhpcy5hdHRyID0gdXRpbC5leHRlbmQoe30sIHRoaXMuYXR0cik7XG5cdFx0ZGVsZXRlIHRoaXMuYXR0ci5zdHJcblx0fVxuXHR0aGlzLmF0dHJbbmFtZV0gPSB2YWx1ZTtcblx0dGhpcy5hdHRyQ29tbWl0ZWQgPSBmYWxzZTtcbn1cblxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5pbnNlcnRCbGFua3MgPSBmdW5jdGlvbihuKSB7XG5cdHZhciBsaW5lID0gdGhpcy5nZXRMaW5lKCk7XG5cdGxpbmUuY2hhbmdlZCA9IHRydWU7XG5cdHZhciBhcmdzID0gQXJyYXkocGFyc2VJbnQobikpO1xuXHRhcmdzLnVuc2hpZnQodGhpcy5jdXJzb3IueCwwKTtcblx0QXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseShsaW5lLmxpbmUsIGFyZ3MpO1xuXHRsaW5lLmxpbmUuc3BsaWNlKHRoaXMud2lkdGgpO1xufVxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih3LCBoKSB7XG5cdHRoaXMuYnVmZmVyLnNwbGljZShoKTtcblx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMuYnVmZmVyLmxlbmd0aDsgaSsrKSB7XG5cdFx0dGhpcy5idWZmZXJbaV0ubGluZS5zcGxpY2Uodyk7XG5cdFx0dGhpcy5idWZmZXJbaV0uY2hhbmdlZCA9IHRydWU7XG5cdH1cblx0dGhpcy53aWR0aCA9IHc7XG5cdHRoaXMuaGVpZ2h0ID0gaDtcblx0dGhpcy5zZXRDdXIoe1xuXHRcdHg6IHRoaXMuY3Vyc29yLngsXG5cdFx0eTogdGhpcy5jdXJzb3IueVxuXHR9KTtcbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUuaW5zZXJ0TGluZXMgPSBmdW5jdGlvbihuLCBwb3MpIHtcblx0aWYocG9zID09PSB1bmRlZmluZWQpXG5cdFx0cG9zID0gdGhpcy5jdXJzb3IueTtcblx0aWYocG9zIDwgdGhpcy5zY3JvbGxSZWdpb25bMF0gfHwgcG9zID4gdGhpcy5zY3JvbGxSZWdpb25bMV0pXG5cdFx0cmV0dXJuO1xuXHR2YXIgdGFpbCA9IHRoaXMuYnVmZmVyLmxlbmd0aCAtIHRoaXMuc2Nyb2xsUmVnaW9uWzFdO1xuXHR2YXIgYXJncyA9IG5ldyBBcnJheShuKTtcblx0YXJncy51bnNoaWZ0KHBvcywgMCk7XG5cdGNvbnNvbGUubG9nKGFyZ3MpO1xuXHRBcnJheS5wcm90b3R5cGUuc3BsaWNlLmFwcGx5KHRoaXMuYnVmZmVyLCBhcmdzKTtcblx0dGhpcy5idWZmZXIuc3BsaWNlKHRoaXMuc2Nyb2xsUmVnaW9uWzFdLCB0aGlzLmJ1ZmZlci5sZW5ndGggLSB0aGlzLnNjcm9sbFJlZ2lvblsxXSAtIHRhaWwpO1xufVxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKGxvY2F0ZUN1cnNvcikge1xuXHR2YXIgcmV0ID0gW11cblx0aWYobG9jYXRlQ3Vyc29yKSB7XG5cdFx0cmV0LnB1c2goQXJyYXkodGhpcy5jdXJzb3IueCszKS5qb2luKCcgJykgKyAndicpXG5cdH1cblx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMuYnVmZmVyLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGxpbmUgPSBbXVxuXHRcdGlmKGxvY2F0ZUN1cnNvcikge1xuXHRcdFx0bGluZS5wdXNoKCh0aGlzLmJ1ZmZlcltpXSAmJiB0aGlzLmJ1ZmZlcltpXS5jaGFuZ2VkKSA/IFwiKlwiIDogXCIgXCIpXG5cdFx0XHRsaW5lLnB1c2goaSA9PSB0aGlzLmN1cnNvci55ID8gXCI+XCIgOiBcIiBcIilcblx0XHR9XG5cdFx0aWYodGhpcy5idWZmZXJbaV0pXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgdGhpcy5idWZmZXJbaV0ubGluZS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRsaW5lLnB1c2godGhpcy5idWZmZXJbaV0ubGluZVtqXSA/ICh0aGlzLmJ1ZmZlcltpXS5saW5lW2pdLmNociB8fCAnICcpIDogJyAnKTtcblx0XHRcdH1cblx0XHRcdHdoaWxlKGxpbmVbbGluZS5sZW5ndGgtMV0gPT09ICcgJykgbGluZS5wb3AoKTtcblx0XHRcdHJldC5wdXNoKGxpbmUuam9pbignJykpO1xuXHR9XG5cdGlmKGxvY2F0ZUN1cnNvcilcblx0XHRyZXQucHVzaChBcnJheSh0aGlzLmN1cnNvci54KzMpLmpvaW4oJyAnKSArICdeJyk7XG5cdHJldHVybiByZXQuam9pbignXFxuJyk7XG59XG5cblRlcm1CdWZmZXIucHJvdG90eXBlLnNldExlZCA9IGZ1bmN0aW9uKG4sdmFsdWUpIHtcblx0aWYobiA9PSAwKVxuXHRcdHRoaXMubGVkcyA9IFshITAsISEwLCEhMCwhITBdO1xuXHRlbHNlXG5cdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhpcy5sZWRzW25dID0gdHJ1ZTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLmxlZHNbbl0gPSB2YWx1ZTtcblx0fVxuXHQvL3RoaXMubWV0YWNoYW5nZWQoKTtcblx0cmV0dXJuIHRoaXM7XG59XG5cblRlcm1CdWZmZXIucHJvdG90eXBlLnNldExlZHMgPSBmdW5jdGlvbihsZWRzKSB7XG5cdGZvcih2YXIgaSBpbiBsZWRzKSB7XG5cdFx0dGhpcy5zZXRMZWQoaSxsZWRzW2ldKTtcblx0fVxufVxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5zZXRNb2RlcyA9IGZ1bmN0aW9uKG1vZGUpIHtcblx0Zm9yKHZhciBpIGluIG1vZGUpIHtcblx0XHR0aGlzLm1vZGVbaV0gPSBtb2RlW2ldO1xuXHR9XG59LFxuXG5UZXJtQnVmZmVyLnByb3RvdHlwZS5zZXREZWZhdWx0QXR0ciA9IGZ1bmN0aW9uKGF0dHJzKSB7XG5cdGZvcih2YXIgaSBpbiBhdHRycykge1xuXHRcdHRoaXMuZGVmYXVsdEF0dHJzW2ldID0gYXR0cnNbaV07XG5cdH1cbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUuc2V0TGluZUF0dHIgPSBmdW5jdGlvbihhdHRycykge1xuXHRmb3IodmFyIGkgaW4gYXR0cnMpIHtcblx0XHR0aGlzLmxpbmVBdHRyW2ldID0gYXR0cnNbaV07XG5cdH1cbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUuc2Nyb2xsID0gZnVuY3Rpb24oZGlyLCBsaW5lcykge1xuXHRpZihsaW5lcyA9PT0gdW5kZWZpbmVkKVxuXHRcdGxpbmVzID0gMTtcblx0Ly8gVE9ETyBoYWNreSFcblx0Zm9yKHZhciBpID0gMDsgaSA8IGxpbmVzOyBpKyspIHtcblx0XHR0aGlzLmJ1ZmZlci5zcGxpY2UodGhpcy5zY3JvbGxSZWdpb25bZGlyID09PSAndXAnID8gMCA6IDFdLCAwLCB0aGlzLmNyZWF0ZUxpbmUoKSk7XG5cdFx0aWYodGhpcy5oZWlnaHQgPj0gdGhpcy5zY3JvbGxSZWdpb25bZGlyID09PSAndXAnID8gMSA6IDBdKVxuXHRcdFx0dGhpcy5idWZmZXIuc3BsaWNlKHRoaXMuc2Nyb2xsUmVnaW9uW2RpciA9PT0gJ3VwJyA/IDEgOiAwXSwgMSk7XG5cdH1cbn1cblxuVGVybUJ1ZmZlci5wcm90b3R5cGUuZXZlbnRUb0tleSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdHZhciBrcGQgPSB0aGlzLm1vZGUuYXBwS2V5cGFkO1xuXHRzd2l0Y2goZXZlbnQud2hpY2gpIHtcblx0XHRjYXNlIDM4OiAvLyB1cFxuXHRcdFx0cmV0dXJuIGtwZCA/IFwiXFx4MWJPQVwiIDogXCJcXHgxYltBXCI7XG5cdFx0Y2FzZSA0MDogLy8gZG93blxuXHRcdFx0cmV0dXJuIGtwZCA/IFwiXFx4MWJPQlwiIDogXCJcXHgxYltCXCI7XG5cdFx0Y2FzZSAzOTogLy8gcmlnaHRcblx0XHRcdHJldHVybiBrcGQgPyBcIlxceDFiT0NcIiA6IFwiXFx4MWJbQ1wiO1xuXHRcdGNhc2UgMzc6IC8vIGxlZnRcblx0XHRcdHJldHVybiBrcGQgPyBcIlxceDFiT0RcIiA6IFwiXFx4MWJbRFwiO1xuXHRcdGNhc2UgODpcblx0XHRcdHJldHVybiBcIlxceDA4XCI7XG5cdFx0Y2FzZSA5OlxuXHRcdFx0cmV0dXJuIFwiXFx0XCI7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LndoaWNoKTtcblx0fVxufVxuXG4vLyBHZW5lcmF0ZXMgYSBkaWZmIGJldHdlZW4gdGhpcy50ZXJtIGFuZCBPdGhlclRlcm1cbi8vIGlmIHRoaXMgZGlmZiBpcyBhcHBsaWVkIHRvIHRoaXMudGVybSBpdCByZXN1bHRzIGluIHRoZSBzYW1lIGFzIE90aGVyVGVybVxuVGVybUJ1ZmZlci5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uKG90aGVyVGVybSkge1xuXG5cdHZhciB0aGlzQnVmZmVyID0gdGhpcy5idWZmZXI7XG5cdHZhciBvdGhlckJ1ZmZlciA9IG90aGVyVGVybS5idWZmZXI7XG5cdHZhciBlbXB0eUxpbmUgPSB7IGxpbmU6IFtdIH07XG5cdHZhciBkaWZmID0gW107XG5cblxuXHQvLyBDaGFuZ2Ugb2Ygc2F2ZUN1cnNvclxuXHRpZiAodGhpcy5zYXZlZEN1cnNvci54ICE9PSBvdGhlclRlcm0uc2F2ZWRDdXJzb3IueCB8fCB0aGlzLnNhdmVkQ3Vyc29yLnkgIT09IG90aGVyVGVybS5zYXZlZEN1cnNvci55KSB7XG5cdFx0ZGlmZi5wdXNoKHthY3Rpb246ICdjaGFuZ2UnLCB0eXBlOiAnc2F2ZWRDdXJzb3InLCBkYXRhOiB7IHg6IG90aGVyVGVybS5zYXZlZEN1cnNvci54ICwgeTogb3RoZXJUZXJtLnNhdmVkQ3Vyc29yLnl9fSk7XG5cdH1cblxuXHQvLyBDaGFuZ2UgaW4gc2l6ZVxuXHRpZiAodGhpcy53aWR0aCAhPT0gb3RoZXJUZXJtLndpZHRoIHx8IHRoaXMuaGVpZ2h0ICE9PSBvdGhlclRlcm0uaGVpZ2h0KSB7XG5cdFx0ZGlmZi5wdXNoKHthY3Rpb246ICdjaGFuZ2UnICwgdHlwZTogJ3NpemUnLCBkYXRhOiB7IHdpZHRoOiBvdGhlclRlcm0ud2lkdGggLCBoZWlnaHQ6IG90aGVyVGVybS5oZWlnaHR9fSk7XG5cdH1cblxuXHQvLyBDaGFuZ2Ugb2YgTGVkc1xuXHR2YXIgbGVkQ2hhbmdlID0ge307XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLmxlZHMpIHtcblx0XHRpZiAodGhpcy5sZWRzW2tleV0gIT09IG90aGVyVGVybS5sZWRzW2tleV0pIHtcblx0XHRcdGxlZENoYW5nZVtrZXldID0gb3RoZXJUZXJtLmxlZHNba2V5XVxuXHRcdH1cblx0fVxuXHRpZiAoT2JqZWN0LmtleXMobGVkQ2hhbmdlKS5sZW5ndGggPiAwKSB7IGRpZmYucHVzaCh7YWN0aW9uOiAnY2hhbmdlJywgdHlwZTogJ2xlZCcsIGRhdGE6IGxlZENoYW5nZX0pIH1cblxuXHQvLyBDaGFuZ2Ugb2YgTW9kZVxuXHR2YXIgbW9kZUNoYW5nZSA9IHt9O1xuXHRmb3IgKHZhciBrZXkgaW4gdGhpcy5tb2RlKSB7XG5cdFx0aWYgKHRoaXMubW9kZVtrZXldICE9PSBvdGhlclRlcm0ubW9kZVtrZXldKSB7XG5cdFx0XHRtb2RlQ2hhbmdlW2tleV0gPSBvdGhlclRlcm0ubW9kZVtrZXldXG5cdFx0fVxuXHR9XG5cdGlmIChPYmplY3Qua2V5cyhtb2RlQ2hhbmdlKS5sZW5ndGggPiAwKSB7IGRpZmYucHVzaCh7YWN0aW9uOiAnY2hhbmdlJywgdHlwZTogJ21vZGUnLCBkYXRhOiBtb2RlQ2hhbmdlfSkgfVxuXG5cdC8vIENoYW5nZSBvZiBEZWZhdWx0QXR0clxuXHR2YXIgZGVmYXVsdEF0dHJDaGFuZ2UgPSB7fTtcblx0Zm9yICh2YXIga2V5IGluIHRoaXMuZGVmYXVsdEF0dHIpIHtcblx0XHRpZiAodGhpcy5kZWZhdWx0QXR0cltrZXldICE9PSBvdGhlclRlcm0uZGVmYXVsdEF0dHJba2V5XSkge1xuXHRcdFx0ZGVmYXVsdEF0dHJDaGFuZ2Vba2V5XSA9IG90aGVyVGVybS5kZWZhdWx0QXR0cltrZXldXG5cdFx0fVxuXHR9XG5cdGlmIChPYmplY3Qua2V5cyhkZWZhdWx0QXR0ckNoYW5nZSkubGVuZ3RoID4gMCkgeyBkaWZmLnB1c2goe2FjdGlvbjogJ2NoYW5nZScsIHR5cGU6ICdkZWZhdWx0QXR0cicsIGRhdGE6IGRlZmF1bHRBdHRyQ2hhbmdlfSkgfVxuXG5cdC8vIENoYW5nZSBvZiAoRGVmYXVsdClMaW5lQXR0clxuXHR2YXIgbGluZUF0dHJDaGFuZ2UgPSB7fTtcblx0Zm9yICh2YXIga2V5IGluIHRoaXMubGluZUF0dHIpIHtcblx0XHRpZiAodGhpcy5saW5lQXR0cltrZXldICE9PSBvdGhlclRlcm0ubGluZUF0dHJba2V5XSkge1xuXHRcdFx0bGluZUF0cnJDaGFuZ2Vba2V5XSA9IG90aGVyVGVybS5saW5lQXR0cltrZXldXG5cdFx0fVxuXHR9XG5cdGlmIChPYmplY3Qua2V5cyhsaW5lQXR0ckNoYW5nZSkubGVuZ3RoID4gMCkgeyBkaWZmLnB1c2goe2FjdGlvbjogJ2NoYW5nZScgLCB0eXBlOiAnbGluZUF0dHInLCBkYXRhOiBsaW5lQXR0ckNoYW5nZX0pIH1cblxuXHQvLyBDaGFuZ2Ugb2Ygc2Nyb2xsUmVnaW9uXG5cdGlmICh0aGlzLnNjcm9sbFJlZ2lvblswXSAhPT0gb3RoZXJUZXJtLnNjcm9sbFJlZ2lvblswXSB8fCB0aGlzLnNjcm9sbFJlZ2lvblsxXSAhPT0gb3RoZXJUZXJtLnNjcm9sbFJlZ2lvblsxXSkge1xuXHRcdGRpZmYucHVzaCh7YWN0aW9uOiAnY2hhbmdlJyAsIHR5cGU6ICdzY3JvbGxSZWdpb24nLCBkYXRhOiBbIG90aGVyVGVybS5zY3JvbGxSZWdpb25bMF0gLCBvdGhlclRlcm0uc2Nyb2xsUmVnaW9uWzFdIF19ICk7XG5cdH1cblxuXHQvLyBDaGFuZ2Ugb2YgVGFic1xuXHRpZiAodGhpcy50YWJzLmpvaW4oJywnKSAhPT0gb3RoZXJUZXJtLnRhYnMuam9pbignLCcpKSB7XG5cdFx0ZGlmZi5wdXNoKHthY3Rpb246ICdjaGFuZ2UnICwgdHlwZTogJ3RhYnMnLCBkYXRhOiBvdGhlclRlcm0udGFicy5zbGljZSgwKX0pO1xuXHR9XG5cblx0Ly8gVE9ETyBEZXRlY3QgQ2hhbmdlIG9mIERlZmF1bHRCdWZmZXJcblx0Ly8gVE9ETyAtIGRvbid0IGV4dGVuZCBhIGxpbmUsIGNsb25lIHRoZSBhcnJheSBvZiB0aGUgbGluZVxuXG5cdC8vIFdlIGhhdmUgbW9yZSBsaW5lcyB0aGFuIHRoZSBvdGhlciBUZXJtQnVmZmVyXG5cdGlmICh0aGlzQnVmZmVyLmxlbmd0aCA+IG90aGVyQnVmZmVyLmxlbmd0aCkge1xuXHRcdC8vIFdlIG5lZWQgdG8gcmVtb3ZlIHRoZSBleHRyYSBsaW5lc1xuXHRcdHZhciBsaW5lc1RvRGVsZXRlID0gdGhpc0J1ZmZlci5sZW5ndGggLSBvdGhlckJ1ZmZlci5sZW5ndGhcblx0XHRkaWZmLnB1c2goe2FjdGlvbjogJ3JlbW92ZScsIHR5cGU6ICdsaW5lJyAsIGRhdGE6IHsgbGluZU51bWJlcjogb3RoZXJCdWZmZXIubGVuZ3RoICwgbGluZXM6IGxpbmVzVG9EZWxldGV9fSk7XG5cdH1cblxuXHQvLyBHbyB0aHJvdWdoIHRoZSBjb21tb24gc2V0IG9mIGxpbmVzXG5cdC8vIFRPRE8gc3luYyB0aGUgc2Nyb2xsYnVmZmVyXG5cdGZvcih2YXIgaT0wOyBpIDwgTWF0aC5taW4odGhpc0J1ZmZlci5sZW5ndGgsIG90aGVyQnVmZmVyLmxlbmd0aCkgOyBpKyspIHtcblx0XHR2YXIgdGhpc0xpbmUgID0gdGhpc0J1ZmZlcltpXSAgfHwgZW1wdHlMaW5lO1xuXHRcdHZhciBvdGhlckxpbmUgPSBvdGhlckJ1ZmZlcltpXSB8fCBlbXB0eUxpbmU7XG5cblx0XHQvLyBUT0RPIFdlIGNhbiBiZSBzbWFydGVyIGJ5IG9ubHkgZGlmZmluZyBwYXJ0cyBvZiB0aGUgbGluZVxuXHRcdC8vIFRoaXMgIT09IG9mIHR3byBsaW5lcyB3aWxsIGFsd2F5cyBoYXBwZW4sIGl0IGlzIG5vdCBhIGdvb2QgdGVzdFxuXHRcdHZhciBpc0RpZmZlcmVudCA9IChKU09OLnN0cmluZ2lmeSh0aGlzTGluZSkgIT09IEpTT04uc3RyaW5naWZ5KG90aGVyTGluZSkpO1xuXHRcdGlmIChpc0RpZmZlcmVudCkge1xuXHRcdFx0ZGlmZi5wdXNoKHthY3Rpb246ICdyZXBsYWNlJywgdHlwZTogJ2xpbmUnLCBkYXRhOiB7bGluZU51bWJlcjogaSAsIGxpbmU6IG90aGVyTGluZX19KTtcblx0XHR9XG5cdH1cblxuXHQvLyBXZSBoYXZlIGxlc3MgbGluZXMgdGhhbiB0aGUgb3RoZXIgVGVybUJ1ZmZlclxuXHRpZiAodGhpc0J1ZmZlci5sZW5ndGggPCBvdGhlckJ1ZmZlci5sZW5ndGgpIHtcblx0XHQvLyBXZSBuZWVkIHRvIGFkZCB0aGUgZXh0cmEgbGluZXNcblx0XHRmb3IodmFyIGkgPSB0aGlzQnVmZmVyLmxlbmd0aCA7IGkgPCBvdGhlckJ1ZmZlci5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIG90aGVyTGluZSA9IG90aGVyQnVmZmVyW2ldIHx8IGVtcHR5TGluZTtcblx0XHRcdGRpZmYucHVzaCh7YWN0aW9uOiAnYWRkJywgdHlwZTogJ2xpbmUnLCAgZGF0YToge2xpbmVOdW1iZXI6IGksIGxpbmU6IG90aGVyTGluZX19KTtcblx0XHR9XG5cdH1cblxuXHQvLyBXZSBuZWVkIHRvIGRvIHRoaXMgYXMgdGhlIGxhc3QgcGF0Y2ggKHRvIG1ha2Ugc3VyZSBhbGwgbGluZXMgaGF2ZSBiZWVuIGNyZWF0ZWQpXG5cdC8vIENoYW5nZSBvZiBDdXJzb3Jcblx0aWYgKHRoaXMuY3Vyc29yLnggIT09IG90aGVyVGVybS5jdXJzb3IueCB8fCB0aGlzLmN1cnNvci55ICE9PSBvdGhlclRlcm0uY3Vyc29yLnkpIHtcblx0XHRkaWZmLnB1c2goe2FjdGlvbjogJ2NoYW5nZScsIHR5cGU6ICdjdXJzb3InLCBkYXRhOiB7IHg6IG90aGVyVGVybS5jdXJzb3IueCAsIHk6IG90aGVyVGVybS5jdXJzb3IueX19KTtcblx0fVxuXG5cdHJldHVybiAoZGlmZik7XG59XG5cblRlcm1CdWZmZXIucHJvdG90eXBlLmFwcGx5ID0gZnVuY3Rpb24oZGlmZikge1xuXG5cdC8vIEl0ZXJhdGUgb3ZlciBhbGwgZW50cmllcyBpbiB0aGUgcGF0Y2hcblx0Zm9yKHZhciBpIGluIGRpZmYpIHtcblxuXHRcdHZhciBkID0gZGlmZltpXS5kYXRhO1xuXHRcdHN3aXRjaChkaWZmW2ldLnR5cGUpIHtcblx0XHRcdGNhc2UgJ2N1cnNvcic6XG5cdFx0XHRcdHRoaXMuc2V0Q3VyKGQpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3NhdmVkQ3Vyc29yJzpcblx0XHRcdFx0dGhpcy5zZXRTYXZlZEN1cnNvcihkKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdzaXplJzpcblx0XHRcdFx0dGhpcy5yZXNpemUoZC53aWR0aCwgZC5oZWlnaHQpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2xlZCc6XG5cdFx0XHRcdHRoaXMuc2V0TGVkcyhkKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdtb2RlJzpcblx0XHRcdFx0dGhpcy5zZXRNb2RlcyhkKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdkZWZhdWx0QXR0cic6XG5cdFx0XHRcdHRoaXMuc2V0RGVmYXVsdEF0dHIoZCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnbGluZUF0dHInOlxuXHRcdFx0XHR0aGlzLnNldExpbmVBdHRyKGQpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3Njcm9sbFJlZ2lvbic6XG5cdFx0XHRcdHRoaXMuc2V0U2Nyb2xsUmVnaW9uKGRbMF0sIGRbMV0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3RhYic6XG5cdFx0XHRcdHRoaXMuc2V0VGFicyhkKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdsaW5lJzpcblx0XHRcdFx0c3dpdGNoIChkaWZmW2ldLmFjdGlvbikge1xuXHRcdFx0XHRcdGNhc2UgJ3JlcGxhY2UnOlxuXHRcdFx0XHRcdFx0dGhpcy5yZXBsYWNlTGluZShkLmxpbmUsIGQubGluZU51bWJlcik7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlICdhZGQnOlxuXHRcdFx0XHRcdFx0dGhpcy5hZGRMaW5lKGQubGluZSwgZC5saW5lTnVtYmVyKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgJ3JlbW92ZSc6XG5cdFx0XHRcdFx0XHR0aGlzLmRlbGV0ZUxpbmVzKGQubGluZXMsIGQubGluZU51bWJlcik7XG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cy5UZXJtQnVmZmVyID0gVGVybUJ1ZmZlcjtcbiIsIihmdW5jdGlvbigpe3ZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmZ1bmN0aW9uIFRlcm1EaWZmKHRlcm1pbmFsKSB7XG5cdHRoaXMuY3Vyc29yWCA9IC0xO1xuXHR0aGlzLmN1cnNvckxpbmUgPSBudWxsO1xuXHR0aGlzLm9sZEJ1ZmZlciA9IFtdO1xuXHR0aGlzLnRlcm1pbmFsID0gdGVybWluYWw7XG59XG5cblRlcm1EaWZmLnByb3RvdHlwZSA9IHtcblx0ZGlmZjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRpZmYgPSB7fVxuXHRcdHZhciBpID0gMCwgaiA9IDA7XG5cdFx0dmFyIGVtcHR5TGluZSA9IHtsaW5lOltdfTtcblx0XHR2YXIgZGVsZXRlZCA9IDA7XG5cdFx0dmFyIHQgPSB0aGlzLnRlcm1pbmFsXG5cblx0XHQvLyBDaGVjayBpZiB0aGUgY3Vyc29yIGhhcyBjaGFuZ2VkIHBvc2l0aW9uXG5cdFx0aWYodGhpcy5jdXJzb3JYICE9PSB0LmN1cnNvci54IHx8IHQuYnVmZmVyW3QuY3Vyc29yLnldICE9PSB0aGlzLmN1cnNvckxpbmUpIHtcblx0XHRcdGlmKHRoaXMuY3Vyc29yTGluZSkge1xuXHRcdFx0XHR0aGlzLmN1cnNvckxpbmUuY2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdGlmKHRoaXMuY3Vyc29yTGluZS5saW5lW3RoaXMuY3Vyc29yWF0pXG5cdFx0XHRcdFx0ZGVsZXRlIHRoaXMuY3Vyc29yTGluZS5saW5lW3RoaXMuY3Vyc29yWF0uY3Vyc29yO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmN1cnNvckxpbmUgPSB0LmdldExpbmUodC5jdXJzb3IueSk7XG5cdFx0XHR0aGlzLmN1cnNvclggPSB0LmN1cnNvci54O1xuXHRcdFx0dGhpcy5jdXJzb3JMaW5lLmNoYW5nZWQgPSB0cnVlO1xuXHRcdFx0aWYoIXRoaXMuY3Vyc29yTGluZS5saW5lW3QuY3Vyc29yLnhdKVxuXHRcdFx0XHR0aGlzLmN1cnNvckxpbmUubGluZVt0LmN1cnNvci54XSA9IHt9O1xuXHRcdFx0dGhpcy5jdXJzb3JMaW5lLmxpbmVbdC5jdXJzb3IueF0uY3Vyc29yID0gdC5tb2RlLmN1cnNvcjtcblx0XHR9XG5cblxuXHRcdC8vIENvbXBhcmUgdGhlIG9sZEJ1ZmZlciBhbmQgY3VycmVudCBCdWZmZXJcblx0XHQvLyBhKSBmaXJzdCBydW4gdGhyb3VnaCB0aGUgbGluZXMgdGhhdCBhcmUgYXZhaWxhYmxlIGluIGJvdGggYnVmZmVycyAoc21hbGxlc3QgbnVtYmVyIG9mIGxpbmVzIG9mIGVhY2ggYnVmZmVyKVxuXHRcdC8vICAgIHRvIHNlZSBpZiB0aGV5IGhhdmUgbGluZXMgaW4gY29tbW9uIG9mIGRpZmZlclxuXHRcdGZvcig7IGkgPCBNYXRoLm1pbih0LmJ1ZmZlci5sZW5ndGgsIHRoaXMub2xkQnVmZmVyLmxlbmd0aCk7IGkrKywgaisrKSB7XG5cdFx0XHR2YXIgbGluZSA9IHQuYnVmZmVyW2ldIHx8IGVtcHR5TGluZVxuXHRcdFx0ICAsIG9sZExpbmUgPSB0aGlzLm9sZEJ1ZmZlcltqXSB8fCBlbXB0eUxpbmVcblxuXHRcdFx0Ly8gV2UgY291bGQgZG8gc21hcnRlciBhbmQgaW5zdGVhZCBvZiBjb21wbGV0ZSBsaW5lcywgc2VlIHdoYXQgdGhlIGxpbmVzIGhhdmUgaW4gY29tbW9uXG5cdFx0XHQvKiB2YXIgb2xkSW5OZXcgPSB1dGlsLmluZGV4T2YodC5idWZmZXIsIG9sZExpbmUpXG5cdFx0XHQgICwgbmV3SW5PbGQgPSB1dGlsLmluZGV4T2YodGhpcy5vbGRCdWZmZXIsIGxpbmUpXG5cblx0XHRcdGlmKG9sZEluTmV3ID09PSAtMSAmJiBuZXdJbk9sZCAhPT0gLTEpIHtcblx0XHRcdFx0ZGVsZXRlZCA9IG5ld0luT2xkIC0gaTtcblx0XHRcdFx0aiArPSBkZWxldGVkO1xuXHRcdFx0XHRvbGRMaW5lID0gdGhpcy5vbGRCdWZmZXJbal0gfHwgZW1wdHlMaW5lXG5cdFx0XHRcdG9sZEluTmV3ID0gdXRpbC5pbmRleE9mKHQuYnVmZmVyLCBvbGRMaW5lKVxuXHRcdFx0fVxuXG5cdFx0XHRpZihsaW5lLmNoYW5nZWQgfHwgbmV3SW5PbGQgPT09IC0xKSB7XG5cdFx0XHRcdGlmKG5ld0luT2xkID09PSAtMSkge1xuXHRcdFx0XHRcdGRpZmZbaV0gPSB7YWN0OiAnKycsIGxpbmU6IGxpbmUsIHJtOiBkZWxldGVkfTtcblx0XHRcdFx0XHRqLS07XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0ZGlmZltpXSA9IHthY3Q6ICdjJywgbGluZTogbGluZSwgcm06IGRlbGV0ZWR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKGRlbGV0ZWQgIT09IDApXG5cdFx0XHRcdGRpZmZbaV0gPSB7cm06IGRlbGV0ZWR9OyovXG5cblx0XHRcdC8vIElmIHRoZSBsaW5lIGNoYW5nZWQoY3Vyc29yKSBvciB0aGUgbGluZSBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgb2xkbGluZVxuXHRcdFx0aWYobGluZS5jaGFuZ2VkIHx8IGxpbmUgIT09IG9sZExpbmUpIHtcblx0XHRcdFx0ZGlmZltpXSA9IHV0aWwuZXh0ZW5kKHthY3Q6ICdjJywgcm06IGRlbGV0ZWR9LCBsaW5lKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0ZGVsZXRlZCA9IDA7XG5cdFx0XHRkZWxldGUgbGluZS5jaGFuZ2VkXG5cdFx0fVxuXG5cdFx0Ly8gRm9yIGFsbCB0aGUgJ2V4dHJhJyBsaW5lcyBjaGVjayB0byBzZWUgaWYgdGhleSB3ZXJlIGFkZGVkIG9yIGRlbGV0ZWRcblx0XHRkZWxldGVkID0gdGhpcy5vbGRCdWZmZXIubGVuZ3RoIC0galxuXHRcdGZvcig7IGkgPCB0LmJ1ZmZlci5sZW5ndGg7IGkrKyl7XG5cdFx0XHRkaWZmW2ldID0gdXRpbC5leHRlbmQoe2FjdDogJysnLCBybTogZGVsZXRlZH0sIHQuYnVmZmVyW2ldKTtcblx0XHRcdGlmKHQuYnVmZmVyW2ldKVxuXHRcdFx0XHRkZWxldGUgdC5idWZmZXJbaV0uY2hhbmdlZFxuXHRcdFx0ZGVsZXRlZCA9IDA7XG5cdFx0fVxuXHRcdGlmKGRlbGV0ZWQgIT09IDApXG5cdFx0XHRkaWZmW2ldID0ge3JtOiBkZWxldGVkfTtcblxuXHRcdHRoaXMub2xkQnVmZmVyID0gdC5idWZmZXIuc2xpY2UoMCk7XG5cdFx0cmV0dXJuIGRpZmY7XG5cdH1cbn1cblxuZXhwb3J0cy5UZXJtRGlmZiA9IFRlcm1EaWZmO1xuXG59KSgpIiwiZXhwb3J0cy5jaHIgPSBcIlwiO1xuZXhwb3J0cy5leGVjID0gZnVuY3Rpb24odGVybSwgZGF0YSkge1xuXHRzd2l0Y2goZGF0YVsxXSkge1xuXHRjYXNlICcoJzpcblx0XHRpZihkYXRhWzJdID09PSB1bmRlZmluZWQpXG5cdFx0XHRyZXR1cm4gMDtcblx0XHR0ZXJtLm1vZGUuZ3JhcGhpYyA9IGRhdGFbMl0gPT09ICcwJztcblx0XHRyZXR1cm4gMztcblx0Y2FzZSAnKSc6XG5cdGNhc2UgJyonOlxuXHRjYXNlICcrJzpcblx0XHRpZihkYXRhWzJdID09PSB1bmRlZmluZWQpXG5cdFx0XHRyZXR1cm4gMDtcblx0XHR0ZXJtLm1vZGUuZ3JhcGhpYyA9IGZhbHNlO1xuXHRcdHJldHVybiAzO1xuXHRjYXNlICdjJzpcblx0XHR0ZXJtLnJlc2V0KCk7XG5cdFx0cmV0dXJuIDI7XG5cdGNhc2UgJ0QnOlxuXHRcdHRlcm0uaW5qZWN0KCdcXHg4NCcpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICdFJzpcblx0XHRpZighdGVybS5tdkN1cigwLCAxKSlcblx0XHRcdHRlcm0uaW5zZXJ0TGluZXMoMSk7XG5cdFx0cmV0dXJuIDI7XG5cdGNhc2UgJ0gnOlxuXHRcdHRlcm0udGFiU2V0KCk7XG5cdFx0cmV0dXJuIDI7XG5cdGNhc2UgJ00nOlxuXHRcdGlmKHRlcm0uY3Vyc29yLnkgPT0gdGVybS5zY3JvbGxSZWdpb25bMF0pXG5cdFx0XHR0ZXJtLnNjcm9sbCgndXAnKTtcblx0XHRlbHNlXG5cdFx0XHR0ZXJtLm12Q3VyKDAsIC0xKVxuXHRcdHJldHVybiAyO1xuXHRjYXNlICdOJzpcblx0XHR0ZXJtLndyaXRlKCdcXHg4ZScpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICdPJzpcblx0XHR0ZXJtLndyaXRlKCdcXHg4ZicpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICdQJzpcblx0XHR0ZXJtLndyaXRlKCdcXHg5MCcpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICdWJzpcblx0XHR0ZXJtLndyaXRlKCdcXHg5NicpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICdXJzpcblx0XHR0ZXJtLndyaXRlKCdcXHg5NycpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICdYJzpcblx0XHR0ZXJtLndyaXRlKCdcXHg5OCcpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICdaJzpcblx0XHR0ZXJtLndyaXRlKCdcXHg5YScpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICdbJzpcblx0XHR0ZXJtLndyaXRlKCdcXHg5YicpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICdcXFxcJzpcblx0XHR0ZXJtLndyaXRlKCdcXHg5YycpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICddJzpcblx0XHR0ZXJtLndyaXRlKCdcXHg5ZCcpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICdeJzpcblx0XHR0ZXJtLndyaXRlKCdcXHg5ZScpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICdfJzpcblx0XHR0ZXJtLndyaXRlKCdcXHg5ZicpO1xuXHRcdHJldHVybiAyO1xuXHRjYXNlICcjJzpcblx0XHRpZihkYXRhWzFdID09PSB1bmRlZmluZWQpXG5cdFx0XHRyZXR1cm4gMDtcblx0XHR2YXIgbGluZSA9IHRlcm0uZ2V0TGluZSgpO1xuXHRcdHN3aXRjaChkYXRhWzFdKSB7XG5cdFx0Y2FzZSAnMyc6XG5cdFx0XHRsaW5lLmF0dHIuZG91YmxldG9wID0gdHJ1ZTtcblx0XHRcdGxpbmUuY2hhbmdlZCA9IHRydWU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICc0Jzpcblx0XHRcdGxpbmUuYXR0ci5kb3VibGVib3R0b20gPSB0cnVlO1xuXHRcdFx0bGluZS5jaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJzUnOlxuXHRcdFx0bGluZS5hdHRyLmRvdWJsZXdpZHRoID0gZmFsc2U7XG5cdFx0XHRsaW5lLmNoYW5nZWQgPSB0cnVlO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnNic6XG5cdFx0XHRsaW5lLmF0dHIuZG91Ymxld2lkdGggPSB0cnVlO1xuXHRcdFx0bGluZS5jaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gMztcblx0Y2FzZSAnZyc6IC8vVmlzdWFsIEJlbGxcblx0XHRyZXR1cm4gMjtcblx0Y2FzZSAnPSc6XG5cdFx0cmV0dXJuIDI7XG5cdGNhc2UgJzwnOlxuXHRcdHJldHVybiAyO1xuXHRjYXNlICc+Jzpcblx0XHRyZXR1cm4gMjtcblx0ZGVmYXVsdDpcblx0XHRjb25zb2xlLmxvZyhcInVua25vd24gZXNjYXBlIGNoYXJhY3RlciBcIiArIGRhdGFbMV0pO1xuXHRcdHJldHVybiAxO1xuXHR9XG59XG4iLCJleHBvcnRzLmV4dGVuZCA9IGZ1bmN0aW9uKG8pe1xuXHRmb3IodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxuXHRcdGZvcih2YXIga2V5IGluIGFyZ3VtZW50c1tpXSlcblx0XHRcdG9ba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuXHRyZXR1cm4gbztcbn1cblxuZXhwb3J0cy5pbmRleE9mID0gZnVuY3Rpb24oYXJyLCBlbGVtKSB7XG5cdGlmKGFyci5pbmRleE9mKVxuXHRcdHJldHVybiBhcnIuaW5kZXhPZihlbGVtKTtcblx0ZWxzZSBpZihlbGVtICE9PSB1bmRlZmluZWQpXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKylcblx0XHRcdGlmKGFycltpXSA9PT0gZWxlbSkgcmV0dXJuIGk7XG5cdHJldHVybiAtMTtcbn1cbiIsImV4cG9ydHMuZXhlYyA9IGZ1bmN0aW9uKHRlcm0sIGNocikge1xuXHRzd2l0Y2goY2hyKSB7XG5cdFx0Y2FzZSAnXFx4MDcnOiAvLyBCRUxMXG5cdFx0XHQvLyBUT0RPXG5cdFx0XHRicmVhaztcblx0XHRjYXNlICdcXHgwOCc6IC8vIEJBQ0tTUEFDRVxuXHRcdFx0dGVybS5tdkN1cigtMSwgMCk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICdcXHgwOSc6IC8vIFRBQlxuXHRcdFx0dGVybS5tdlRhYigxKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ1xcbic6IC8vIExJTkVGRUVEXG5cdFx0XHR0ZXJtLmxpbmVGZWVkKCk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICdcXHgwZCc6IC8vIENBUlJJQUdFIFJFVFVSTlxuXHRcdFx0dGVybS5zZXRDdXIoe3g6MCB9KTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ1xceDdmJzogLy8gREVMRVRFXG5cdFx0XHR0ZXJtLmRlbGV0ZUNoYXIoMSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICdcXHg4OCc6IC8vIFRBQlNFVFxuXHRcdFx0dGVybS5zZXRUYWIoKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ1xceDBlJzpcdC8qIFNPICovXG5cdFx0Y2FzZSAnXFx4MGYnOlx0LyogU0kgKi9cblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0ZXJtLmluamVjdChjaHIpO1xuXHR9XG59XG4iLCJ2YXIgc2dyID0gcmVxdWlyZSgnLi9zZ3InKTtcblxudmFyIENTSV9QQVRURVJOID0gL15cXHgxYlxcWyhbPyE+XT8pKFswLTk7XSopKFtAQS1aYS16YF0/KS87XG5cbmZ1bmN0aW9uIHBhcnNlQ3NpKGRhdGEpIHtcblx0dmFyIG1hdGNoID0gQ1NJX1BBVFRFUk4uZXhlYyhkYXRhKVxuXHRpZihtYXRjaCA9PT0gbnVsbClcblx0XHRyZXR1cm4gbnVsbFxuXHRyZXR1cm4ge1xuXHRcdGFyZ3M6IG1hdGNoWzJdID09PSBcIlwiID8gW10gOiBtYXRjaFsyXS5zcGxpdCgnOycpLFxuXHRcdG1vZDogbWF0Y2hbMV0sXG5cdFx0Y21kOiBtYXRjaFszXSxcblx0XHRvZmZzZXQ6IG1hdGNoWzBdLmxlbmd0aFxuXHR9O1xufVxuXG5leHBvcnRzLmNociA9IFwiW1wiO1xuZXhwb3J0cy5leGVjID0gZnVuY3Rpb24odGVybSwgZGF0YSkge1xuXHR2YXIgbWF0Y2ggPSBwYXJzZUNzaShkYXRhKTtcblx0aWYobWF0Y2ggPT09IG51bGwgfHwgKG1hdGNoLm9mZnNldCAhPSBkYXRhLmxlbmd0aCAmJiBtYXRjaC5jbWQgPT09ICcnKSkge1xuXHRcdGNvbnNvbGUubG9nKFwiR2FyYmFnZWQgQ1NJOiBcIiArIChtYXRjaCA/IGRhdGEuc2xpY2UoMCwgbWF0Y2gub2Zmc2V0KzEpIDogXCJ1bmtub3duXCIpKTtcblx0XHQvLyBDb25zdW1lIGVzY2FwZSBjaGFyYWN0ZXIuXG5cdFx0cmV0dXJuIDE7XG5cdH1cblx0dmFyIG4gPSArbWF0Y2guYXJnc1swXSwgbSA9ICttYXRjaC5hcmdzWzFdO1xuXHRzd2l0Y2gobWF0Y2guY21kKSB7XG5cdGNhc2UgJyc6IC8vIFVuZmluaXNoZWQgc2VxdWVuY2UuXG5cdFx0cmV0dXJuIDA7XG5cdGNhc2UgJ0AnOiAvLyBJQ0hcblx0XHR0ZXJtLmluc2VydEJsYW5rcyhuIHx8IDEpO1xuXHRcdGJyZWFrO1xuXHRjYXNlICdBJzogLy8gQ1VVXG5cdFx0dGVybS5tdkN1cigwLCAtbiB8fCAxKTtcblx0XHRicmVhaztcblx0Y2FzZSAnQic6IC8vIENVRFxuXHRcdHRlcm0ubXZDdXIoMCwgbiB8fCAxKTtcblx0XHRicmVhaztcblx0Y2FzZSAnQyc6IC8vIENVRlxuXHRjYXNlICdhJzogLy8gSFBSXG5cdFx0dGVybS5tdkN1cihuIHx8IDEsIDApO1xuXHRcdGJyZWFrO1xuXHRjYXNlICdEJzogLy8gQ1VCXG5cdFx0dGVybS5tdkN1cigtbiB8fCAxLCAwKTtcblx0XHRicmVhaztcblx0Y2FzZSAnRSc6IC8vIENOTFxuXHRcdHRlcm0ubXZDdXIoMCwgbiB8fCAxKS5zZXRDdXIoe3g6IDB9KTtcblx0XHRicmVhaztcblx0Y2FzZSAnRic6IC8vIENQTFxuXHRcdHRlcm0ubXZDdXIoMCwgLW4gfHwgMSkuc2V0Q3VyKHt4OiAwfSk7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJ2AnOiAvLyBIUEFcblx0Y2FzZSAnRyc6IC8vIENIQVxuXHRcdHRlcm0uc2V0Q3VyKHt4OiAobiB8fCAxKSAtIDF9KTtcblx0XHRicmVhaztcblx0Y2FzZSAnZic6IC8vIEhWUFxuXHRjYXNlICdIJzogLy8gQ1VQXG5cdFx0dGVybS5zZXRDdXIoe3k6IChuIHx8IDEpIC0gMSwgeDogKG0gfHwgMSkgLSAxfSk7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJ0knOiAvLyBDSFRcblx0XHR0ZXJtLm12VGFiKG4gfHwgMSk7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJ0onOiAvLyBFRCAvIERFQ1NFRFxuXHRcdHRlcm0uZXJhc2VJbkRpc3BsYXkobik7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJ0snOiAvLyBFTCAvIERFQ1NFTFxuXHRcdHRlcm0uZXJhc2VJbkxpbmUobik7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJ0wnOiAvLyBJTFxuXHRcdHRlcm0uaW5zZXJ0TGluZXMobiB8fCAxKTtcblx0XHRicmVhaztcblx0Y2FzZSAnTSc6XG5cdFx0dGVybS5kZWxldGVMaW5lcyhuIHx8IDEpO1xuXHRcdGJyZWFrO1xuXHRjYXNlICdQJzogLy8gRENIXG5cdFx0dGVybS5kZWxldGVDaGFyYWN0ZXJzKG4gfHwgMSk7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJ1MnOiAvLyBTVVxuXHRcdHRlcm0uc2Nyb2xsKCd1cCcpO1xuXHRcdGJyZWFrXG5cdGNhc2UgJ1QnOiAvLyBTRCAvIEluaXRpYXRlIGhpZ2hsaWdodCBtb3VzZSB0cmFja2luZ1xuXHRcdGlmKG1hdGNoLmFyZ3MgPT09IDApXG5cdFx0XHR0ZXJtLnNjcm9sbCgnZG93bicpO1xuXHRcdGVsc2Vcblx0XHRcdGNvbnNvbGUubG9nKCdOb3QgaW1wbGVtZW50ZWQgJyArIG1hdGNoLmNtZCk7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJ1gnOiAvLyBFQ0hcblx0XHR0ZXJtLmVyYXNlQ2hhcmFjdGVycyhuIHx8IDEpO1xuXHRcdGJyZWFrO1xuXHRjYXNlICdaJzogLy8gQ0JUXG5cdFx0dGVybS5tdlRhYigtKG4gfHwgMSkpO1xuXHRcdGJyZWFrO1xuXHRjYXNlICdiJzogLy8gUkVQXG5cdFx0Ly8gVE9ET1xuXHRcdGNvbnNvbGUubG9nKCdOb3QgaW1wbGVtZW50ZWQgJyArIG1hdGNoLmNtZCk7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJ2QnOiAvLyBWUEFcblx0XHR0ZXJtLnNldEN1cih7eToobiB8fCAxKSAtIDF9KTtcblx0XHRicmVhaztcblx0Y2FzZSAnZyc6IC8vIFRCQ1xuXHRcdHRlcm0udGFiQ2xlYXIobik7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJ2gnOiAvLyBTTSAvIERFQ1NFVFxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtYXRjaC5hcmdzLmxlbmd0aDsgaSsrKVxuXHRcdFx0c2V0TW9kZSh0ZXJtLCBtYXRjaC5tb2QsIG1hdGNoLmFyZ3NbaV0sIHRydWUpO1xuXHRcdGJyZWFrO1xuXHRjYXNlICdpJzogLy8gTUNcblx0XHQvLyBUT0RPXG5cdFx0Y29uc29sZS5sb2coJ05vdCBpbXBsZW1lbnRlZCAnICsgbWF0Y2guY21kKTtcblx0XHRicmVhaztcblx0Y2FzZSAnbCc6IC8vIFJNIC8gREVDUlNUXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IG1hdGNoLmFyZ3MubGVuZ3RoOyBpKyspXG5cdFx0XHRzZXRNb2RlKHRlcm0sIG1hdGNoLm1vZCwgbWF0Y2guYXJnc1tpXSwgZmFsc2UpO1xuXHRcdGJyZWFrO1xuXHRjYXNlICdtJzogLy8gU0dSXG5cdFx0c2dyLmV4ZWModGVybSwgbWF0Y2guYXJncyk7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJ24nOiAvLyBEU1Jcblx0Y2FzZSAncCc6IC8vIHBvaW50ZXJNb2RlXG5cdFx0Ly8gVE9ET1xuXHRcdGNvbnNvbGUubG9nKCdOb3QgaW1wbGVtZW50ZWQgJyArIG1hdGNoLmNtZCk7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJ3EnOiAvLyBERUNMTFxuXHRcdHRlcm0uc2V0TGVkKG4pO1xuXHRcdGJyZWFrO1xuXHRjYXNlICdyJzogLy8gREVDU1RCTSAvIFJlc3RvcmUgREVDIFByaXZhdGUgTW9kZSBWYWx1ZXNcblx0XHRpZihtYXRjaC5hcmdzLmxlbmd0aCA9PSAyKVxuXHRcdFx0dGVybS5zZXRTY3JvbGxSZWdpb24obi0xLCBtKTtcblx0XHQvL2Vsc2Vcblx0XHQvL1x0VE9ET1xuXHRcdGJyZWFrO1xuXHRjYXNlICdzJzogLy8gU2F2ZSBDdXJzb3Jcblx0XHRpZihtYXRjaC5hcmdzLmxlbmd0aCA9PSAwKVxuXHRcdFx0dGVybS5jdXJTYXZlKCk7XG5cdFx0Ly9lbHNlXG5cdFx0Ly9cdFRPRE9cblx0XHRicmVhaztcblx0Y2FzZSAndCc6XG5cdFx0Ly8gVE9ET1xuXHRcdGNvbnNvbGUubG9nKCdOb3QgaW1wbGVtZW50ZWQgJyArIG1hdGNoLmNtZCk7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJ3UnOiAvLyBSZXN0b3JlIEN1cnNvclxuXHRcdGlmKG1hdGNoLmFyZ3MubGVuZ3RoID09IDApXG5cdFx0XHR0ZXJtLmN1clJlc3QoKTtcblx0XHQvL2Vsc2Vcblx0XHQvL1x0VE9ET1xuXHRcdGJyZWFrO1xuXHRjYXNlICdjJzogLy8gREFcblx0XHRpZih0eXBlb2YgdGVybS5hbnN3ZXIgPT09ICdmdW5jdGlvbicpXG5cdFx0XHR0ZXJtLmFuc3dlcih0ZXJtLCBcIlxceDFiPjA7OTU7Y1wiKTtcblx0XHRlbHNlXG5cdFx0XHRjb25zb2xlLmxvZygnZGV2aWNlIGF0dHJpYnV0ZXMgcmVxdWVzdGVkLiBwbGVhc2UgaW1wbGVtZW50IHRlcm0uYW5zd2VyID0gZnVuY3Rpb24odGVybWluYWwsIG1zZykgeyAuLi4gfScpO1xuXHRcdGJyZWFrO1xuXHRjYXNlICd2JzogLy8gREVDQ1JBXG5cdGNhc2UgJ3cnOiAvLyBERUNFRlJcblx0Y2FzZSAneCc6IC8vIERFQ1JFUVRQQVJNIC8gREVDU0FDRSAvIERFQ0ZSQVxuXHRjYXNlICd5JzogLy8gREVDUlFDUkFcblx0Y2FzZSAneic6IC8vIERFQ0VMUiAvIERFQ0VSQVxuXHRjYXNlICd7JzogLy8gREVDU0xFIC8gREVDU0VSQVxuXHRjYXNlICd8JzogLy8gREVDUlFMUFxuXHRjYXNlICd9JzogLy8gREVDSUNcblx0Y2FzZSAnfic6IC8vIERFQ0RDXG5cdFx0Ly8gVE9ET1xuXHRcdGNvbnNvbGUubG9nKCdOb3QgaW1wbGVtZW50ZWQgJyArIG1hdGNoLmNtZCk7XG5cdFx0YnJlYWs7XG5cdGRlZmF1bHQ6XG5cdFx0Y29uc29sZS5sb2coXCJVbmtub3duIENTSS1jb21tYW5kICdcIittYXRjaC5jbWQrXCInXCIpO1xuXHR9XG5cdHJldHVybiBtYXRjaC5vZmZzZXQ7XG59XG5cbnZhciBtb2RlcyA9IHtcblx0JzQnOiAnaW5zZXJ0Jyxcblx0Jz8xJzogJ2FwcEtleXBhZCcsXG5cdCc/MTInOiAnY3Vyc29yQmxpbmsnLFxuXHQnPzEwMDAnOiAnbW91c2VidG4nLFxuXHQnPzEwMDInOiAnbW91c2VtdG4nLFxuXHQnPzIwJzogJ2NybGYnLFxuXHQnPzI1JzogJ2N1cnNvcicsXG5cdCc/NSc6ICdyZXZlcnNlJyxcblx0Jz83JzogJ3dyYXAnLFxufVxuXG5mdW5jdGlvbiBzZXRNb2RlKHRlcm0sIG1vZCwgbiwgdikge1xuXHR2YXIgaWRlbnRpZmllciA9IG1vZCtuO1xuXHRzd2l0Y2goaWRlbnRpZmllcikge1xuXHRjYXNlICc/MTA0Nyc6XG5cdFx0dGVybS5hbHRCdWZmZXIgPSBbXTtcblx0XHQvLyBObyBicmVhayBoZXJlLlxuXHRjYXNlICc/NDcnOlxuXHRcdHRlcm0uYnVmZmVyID0gdiA/IHRlcm0uYWx0QnVmZmVyIDogdGVybS5kZWZhdWx0QnVmZmVyO1xuXHRcdGJyZWFrO1xuXHRjYXNlICc/MTA0OCc6XG5cdFx0aWYodilcblx0XHRcdHRlcm0uc2F2ZUN1cnNvcigpO1xuXHRcdGVsc2Vcblx0XHRcdHRlcm0ucmVzdG9yZUN1cnNvcigpO1xuXHRcdGJyZWFrO1xuXHRjYXNlICc/MTA0OSc6XG5cdFx0c2V0TW9kZSh0ZXJtLCBtb2QsICcxMDQ4Jywgdik7XG5cdFx0c2V0TW9kZSh0ZXJtLCBtb2QsICcxMDQ3Jywgdik7XG5cdFx0aWYodilcblx0XHRcdHRlcm0uc2V0Q3VyKHt4OjAseTowfSk7XG5cdFx0YnJlYWs7XG5cdGNhc2UgJz80JzogLy8gSWdub3JlXG5cdFx0YnJlYWs7XG5cdGRlZmF1bHQ6XG5cdFx0aWYobW9kZXNbaWRlbnRpZmllcl0pXG5cdFx0XHR0ZXJtLm1vZGVbbW9kZXNbaWRlbnRpZmllcl1dID0gdjtcblx0XHRlbHNlXG5cdFx0XHRjb25zb2xlLmxvZyhcIlVua25vd24gbW9kZTogXCIgKyBpZGVudGlmaWVyKTtcblx0fVxufVxuIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZXhwb3J0cy5leGVjID0gZnVuY3Rpb24odGVybSwgc2dyKSB7XG5cdGlmKHNnci5sZW5ndGggPT09IDApXG5cdFx0dGVybS5yZXNldEF0dHIoKTtcblx0Zm9yKHZhciBpID0gMDsgaSA8IHNnci5sZW5ndGg7IGkrKykge1xuXHRcdHN3aXRjaChwYXJzZUludChzZ3JbaV0pKSB7XG5cdFx0Y2FzZSAwOlxuXHRcdFx0dGVybS5yZXNldEF0dHIoKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMTpcblx0XHRcdHRlcm0uY2hBdHRyKCdib2xkJywgdHJ1ZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDM6XG5cdFx0XHR0ZXJtLmNoQXR0cignaXRhbGljJywgdHJ1ZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDQ6XG5cdFx0XHR0ZXJtLmNoQXR0cigndW5kZXJsaW5lJywgdHJ1ZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDU6XG5cdFx0Y2FzZSA2OlxuXHRcdFx0dGVybS5jaEF0dHIoJ2JsaW5rJywgdHJ1ZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDc6XG5cdFx0XHRpZighdGVybS5hdHRyLmludmVyc2UpIHtcblx0XHRcdFx0dGVybS5jaEF0dHIoJ2ludmVyc2UnLCB0cnVlKTtcblx0XHRcdFx0dmFyIHRtcCA9IHRlcm0uYXR0ci5mZztcblx0XHRcdFx0dGVybS5jaEF0dHIoJ2ZnJywgdGVybS5hdHRyLmJnKTtcblx0XHRcdFx0dGVybS5jaEF0dHIoJ2JnJywgdG1wKTtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMjI6XG5cdFx0XHR0ZXJtLnJlc2V0QXR0cignYm9sZCcpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAyMzpcblx0XHRcdHRlcm0uY2hBdHRyKCdpdGFsaWMnLCBmYWxzZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDI0OlxuXHRcdFx0dGVybS5jaEF0dHIoJ3VuZGVybGluZScsIGZhbHNlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMjU6XG5cdFx0XHR0ZXJtLmNoQXR0cignYmxpbmsnLCBmYWxzZSk7XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgMjc6XG5cdFx0XHRpZih0ZXJtLmF0dHIuaW52ZXJzZSkge1xuXHRcdFx0XHR0ZXJtLmNoQXR0cignaW52ZXJzZScsIGZhbHNlKTtcblx0XHRcdFx0dmFyIHRtcCA9IHRlcm0uYXR0ci5mZztcblx0XHRcdFx0dGVybS5jaEF0dHIoJ2ZnJywgdGVybS5hdHRyLmJnKTtcblx0XHRcdFx0dGVybS5jaEF0dHIoJ2JnJywgdG1wKTtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMzg6XG5cdFx0XHRpZihzZ3JbaSsxXSA9PSA1KVxuXHRcdFx0XHR0ZXJtLmNoQXR0cignZmcnLCAtc2dyW2krPTJdKTtcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSAzOTpcblx0XHRcdHRlcm0ucmVzZXRBdHRyKCdmZycpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSA0ODpcblx0XHRcdGlmKHNncltpKzFdID09IDUpXG5cdFx0XHRcdHRlcm0uY2hBdHRyKCdiZycsIC1zZ3JbaSs9Ml0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSA0OTpcblx0XHRcdHRlcm0ucmVzZXRBdHRyKCdiZycpO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGlmKHNncltpXSA+PSAzMCAmJiBzZ3JbaV0gPD0gMzcpXG5cdFx0XHRcdHRlcm0uY2hBdHRyKCdmZycsIHNncltpXSAtIDMwKTtcblx0XHRcdGVsc2UgaWYoc2dyW2ldID49IDQwICYmIHNncltpXSA8PSA0Nylcblx0XHRcdFx0dGVybS5jaEF0dHIoJ2JnJywgc2dyW2ldIC0gNDApO1xuXHRcdFx0ZWxzZSBpZihzZ3JbaV0gPj0gOTAgJiYgc2dyW2ldIDw9IDk5KVxuXHRcdFx0XHR0ZXJtLmNoQXR0cignZmcnLCBzZ3JbaV0gLSA5MCArIDgpO1xuXHRcdFx0ZWxzZSBpZihzZ3JbaV0gPj0gMTAwICYmIHNncltpXSA8PSAxMDkpXG5cdFx0XHRcdHRlcm0uY2hBdHRyKCdiZycsIHNncltpXSAtIDEwMCArIDgpO1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHRjb25zb2xlLmxvZyhcIlVua293biBzZ3IgY29tbWFuZCAnXCIrc2dyW2ldK1wiJ1wiKTtcblx0XHR9XG5cdH1cbn1cbiJdfQ==
;