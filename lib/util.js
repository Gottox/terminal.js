"use strict";

var wcwidth = require("wcwidth");

var A = Array.prototype;

exports.extend = function(o){
	for(var i = 1; i < arguments.length; i++)
		for(var key in arguments[i])
			o[key] = arguments[i][key];
	return o;
};

function repeat(str, n) {
	var i, result = "";
	for(i = 0; i < n; i++) {
		result += str;
	}
	return result;
}

exports.repeat = repeat;

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

function dbcswidth(str) {
	return str.split("").reduce(function(sum, c) {
		return sum + (c.charCodeAt(0) > 255 ? 2 : 1);
	}, 0);
}

/**
* calculate width of string.
* @params {string} str - string to calculate
* @params {boolean} stringWidth - calculate width by wcwidth or String.length
*/
function getWidth(stringWidth, str) {
	if (!stringWidth || !stringWidth.toLowerCase)
		return str.length;
	switch (stringWidth.toLowerCase()) {
		case "wcwidth":
			return wcwidth(str);
		case "dbcs":
			return dbcswidth(str);
		case "length":
			return str.length;
		default:
			return str.length;
	}
}

/**
* calculate the position that the prefix of string is a specific width
* @params {string} str - string to calculate
* @params {number} width - the width of target string
* @params {boolean} stringWidth - calculate width by wcwidth or String.length
*/
function indexOfWidth(stringWidth, str, width) {
	if (stringWidth === false)
		return width;
	for (var i = 0; i <= str.length; i++) {
		if (getWidth(stringWidth, str.substr(0, i)) > width)
			return i - 1;
	}
	return str.length;
}

/**
* extract parts of string, beginning at the character at the specified position,
* and returns the specified width of characters. if the character is incomplete,
* it will be replaced by space.
* @params {string} str - string to calculate
* @params {number} start - the beginning position of string
* @params {number} width - the width of target string
* @params {boolean} stringWidth - calculate width by wcwidth or String.length
*/
function substrWidth(stringWidth, str, startWidth, width) {
	var length = width;
	var start = startWidth;
	var prefixSpace = 0, suffixSpace;
	if (stringWidth !== false) {
		start = indexOfWidth(stringWidth, str, startWidth);
		if (getWidth(stringWidth, str.substr(0, start)) < startWidth) {
			start++;
			prefixSpace = getWidth(stringWidth, str.substr(0, start)) - startWidth;
		}
		length = indexOfWidth(stringWidth, str.substr(start), width - prefixSpace);
		suffixSpace = Math.min(width, getWidth(stringWidth, str.substr(start))) -
			(prefixSpace + getWidth(stringWidth, str.substr(start, length)));
	}
	return repeat(" ", prefixSpace) + str.substr(start, length) + repeat(" ", suffixSpace);
}

exports.getWidth = getWidth;
exports.indexOfWidth = indexOfWidth;
exports.substrWidth = substrWidth;
