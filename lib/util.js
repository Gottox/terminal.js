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
