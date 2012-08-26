//This is a utility library

var parse = function () {

}

var path = require('path');
var util = require('util');

parse.logLevel = 50;

var dnsBrowseEvent = function (timeStamp,eventType,domain,serviceType,instanceName) {
	this.eventType = eventType;
	this.instanceName = instanceName;
	this.serviceType = serviceType;
	this.domain = domain;
	this.timeStamp = timeStamp
};

var dnsLookup = function (hostName,textRecords) {
	this.hostName = hostName;
	this.textRecords = textRecords;
};

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

parse.parseToTextRecords = function(data) {
	data = data.toString();
	var d = data.split(" ");
	
	var records = d[11].split(';');
	var Records = {};
	
	for (var i = 0; i < records.length; i++) {
		var temp = records[i].split('=');
		if (temp.length > 1 && temp[1].indexOf("\r\n") != -1) {
			temp[1] = temp[1].split("\r\n")[0];
		}
		Records[temp[0]] = temp[1];
	}
	
	return Records;
}

parse.parseToLookupObject = function (data) {
	var obj;
	var objs = [];	
	data = data.toString();
	var d = data.split(" ");
	
	if (d.length > 2) {	
		var d2 = this.parseBlanks(d);	
		
		if (d2[0] === 'Lookup') {
			//remove "Lookup Laptop._webdav._tcp.local."
			d2.splice(0,2);
		}
		//parse.log('parse',d,d2[6])
		//console.log('good lookup',d2)
		obj = new dnsLookup(d2[6].split(':')[0],d2[7]);					
	  
		return obj;
	} else {
		//console.log('null lookup',d)
		return undefined;
	}
}

parse.parseToIp = function (data) {
	var obj;
	var objs = [];	
	data = data.toString();
	var d = data.split(" ");
	
	var d2 = this.parseBlanks(d);
	
	for (var i = 0;i < d2.length; i++) {
		//console.log(d2[i]);
	}
	//console.log(d2[5],d2[12]);
	
	if (d[0] === 'Timestamp')
		return d2[12];
	//console.log(d2[5]);
  
	return d2[5];
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

parse.parseToBrowseEvents = function(data) {
	var event;
	var events = [];	
	data = data.toString();
	var d = data.split(" ");
	
	var d2 = this.parseBlanks(d);
	
	var k;
    if (d[0] === "Browsing") {		
		for (k = 12; k < d2.length; k += 7) {				
			event = new dnsBrowseEvent(d2[k],d2[k+1],d2[k+4],d2[k+5],d2[k+6]);			
			
			events.push(event);
		}		
    } else {		
		for (k = 0; k < d2.length; k += 7) {	
			event = new dnsBrowseEvent(d2[k],d2[k+1],d2[k+4],d2[k+5],d2[k+6]);
						
			events.push(event);
		}
    }
	return events;
};

//converts path to specifies OS delimiters
parse.switchSeparator = function (filePath,type) {
	var newPath = "";
	var currentType;
	var sep = {windows: '\\', linux: '/'};	
	
	if (filePath.indexOf('\\') !== -1) {
		currentType = 'windows';
		
	} 	
	else if (filePath.indexOf('/') !== -1) {
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