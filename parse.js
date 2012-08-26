//This is a utility library

var parse = function () {

}

var path = require('path');
var util = require('util');

parse.logLevel = 50;

parse.setLogLevel = function (level) {
	if (level) {
		parse.logLevel = level;
	}
}

//MAKE SURE PASSED IN TEXT IS A STRING! if you try to pass numbers
//they could be interpreted as log levels!

//j is a variable of type int. 
//ex parse.log('counter',j); 

//1 is highest 99 lowest
//0 no logging
//set regular logs to 50 
//leaves room for mundance logs
//args - text,text,text,.....,log level,useTimeStamp
parse.log = function () {
	var level;
	var text = "";
	if ((arguments.length > 1 && typeof arguments[arguments.length-1] !== "number") || arguments.length === 1) {
		level = 50;
	} else if (arguments.length > 1 && typeof arguments[arguments.length-2] === "number") {
		level = arguments[arguments.length-2];
	}
	
	for (arg in arguments) {
		if (level <= parse.logLevel && parse.logLevel !== 0) {
			if (parse.toType(arguments[arg]) === 'object') {
				console.log(arguments[arg])
				text += util.inspect(arguments[arg]) + " ";
			} else {
				//console.log('OOOOOOOOOOO',arg,arguments[arg],parse.toType(arguments[arg]))
				text += arguments[arg] + " ";
			}
			
		}	
	}
	if (text !== "") {
		if (arguments[arguments.length-1] === true) {
			util.log(text);
		} else {
			console.log(level,text);
		}
	}
}

parse.parseBlanks = function (d) {
	var d2 = [];
			  
	for (var i = 0; i < d.length; i++) {
		if (d[i] != "") {
			if (d[i].indexOf("\r\n") != -1) {
				temp = d[i].split("\r\n");
				for (var j = 0; j < temp.length; j++) {
					if (temp[j] != "" && temp[j] != " ") {
						d2.push(temp[j]);
					}
				}
			} else if (d[i].indexOf("\n") != -1) {
				temp = d[i].split("\n");
				for (var j = 0; j < temp.length; j++) {
					if (temp[j] != "" && temp[j] != " ") {
						d2.push(temp[j]);
					}
				}
			} else {
				if (d[i] != "" && d[i] != " ") {
						d2.push(d[i]);
					}				
			}
		}
	}  
	
	return d2;
}

//converts path to specific OS delimiters
parse.switchSeparator = function (filePath,type) {
	var newPath = "";
	var currentType;
	var sep = {windows: '\\', linux: '/'};	
	
	if (filePath.indexOf(sep.windows) !== -1) {
		currentType = 'windows';
		
	} 	
	else if (filePath.indexOf(sep.linux) !== -1) {
		currentType = 'linux';
	}
	else {
		currentType = 'unknown';
		return filePath
	}
	
	if (currentType === type) {
		return filePath;
	}
	
	//split existing path
	filePath = filePath.split(sep[currentType]);
	
	//rejoin path using chosen OS delimiters
	for (str in filePath) {	
		newPath+=filePath[str] + sep[type];
	}
	
	return newPath;
}

parse.toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}


exports.parse = parse;