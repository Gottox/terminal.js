"use strict";

var wcwidth = require("wcwidth");

var A = Array.prototype;

exports.extend = function(o){
	for(var i = 1; i < arguments.length; i++)
		for(var key in arguments[i])
			o[key] = arguments[i][key];
	return o;
};

exports.repeat = function(str, n) {
	var i, result = "";
	for(i = 0; i < n; i++) {
		result += str;
	}
	return result;
};

exports.objSplice = function(obj, length, start, end, replace) {
	var splice = A.splice, args = [ start, end ];
	A.push.apply(args, replace);
	obj.length = length;
	splice.apply(obj, args);
	delete obj.length;
};

exports.indexOf = A.indexOf ?
	function() {
		var args = A.slice.call(arguments);
		return A.indexOf.apply(args.shift(), args);
	} :
	function(obj, needle) {
		for (var i = 0; i < this.length; i++)
			if (this[i] === needle) return i;
		return -1;
	};

/**
* calculate width of string.
* @params {string} str - string to calculate
* @params {boolean} useWcwidth - calculate width by wcwidth or String.length
*/
function getWidth(str, useWcwidth) {
	return useWcwidth === true ? wcwidth(str) : str.length;
};

/**
* calculate the position that the prefix of string is a specific width
* @params {string} str - string to calculate
* @params {number} width - the width of target string
* @params {boolean} useWcwidth - calculate width by wcwidth or String.length
*/
function indexOfWidth(str, width, useWcwidth) {
	if (useWcwidth !== true)
		return width;
	for (var i = 0; i <= str.length; i++) {
		if (getWidth(str.substr(0, i), useWcwidth) > width)
			return i - 1;
	}
	return str.length;
};

/**
* extract parts of string, beginning at the character at the specified position,
* and returns the specified width of characters.
* @params {string} str - string to calculate
* @params {number} start - the beginning position of string
* @params {number} width - the width of target string
* @params {boolean} useWcwidth - calculate width by wcwidth or String.length
*/
function substrWidth(str, start, width, useWcwidth) {
	var length = width;
	if (useWcwidth === true) {
		start = indexOfWidth(str, start, useWcwidth);
		length = indexOfWidth(str.substr(start), width, useWcwidth);
	}
	return str.substr(start, length);
};

exports.getWidth = getWidth;
exports.indexOfWidth = indexOfWidth;
exports.substrWidth = substrWidth;
