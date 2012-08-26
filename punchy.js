var punchy = function () {

}

var http = require('http');
var fs = require('fs');
var path = require('path');
var io = require('socket.io');
//var upnp = require("lib/upnp");
var sock = require('./sock').sock;

var Server = http.createServer(punchy.requestCB);

Server.listen(80);
io = io.listen(Server);
sock.initialize(io,[],{onConnect: punchy.socketConnectionCB, onMessage: punchy.messageCB});

var clients = {};

punchy.requestCB = function (request, response) {
	console.log('request starting...');	
	console.log(request.url);	
	
	var body = "";
	var filePath = '.' + request.url;
	
	if (filePath == './')
		filePath = './index.htm';

	var extname = path.extname(filePath);
	var contentType = 'text/html';
	var POST;
	var method = request.method;
	
	request.on('data', function (data) {
		body += data;
		console.log("data");	
	});
		
	request.on('end', function () {
		console.log("end");		
		
		if (request.url.split("/")[0] == "punch") {
			console.log("API");
			
			switch (method) {
				case 'GET':
					console.log("GET");	
					
					//response.write(JSON.stringify());
					break;
				case 'PUT':					
					console.log("PUT");	
					
					body = JSON.parse(body);					
					var ip = body.ip || request.connection.remoteAddress;
					
					server.socket.emit('someEvent', someData);
					break;
				case 'DELETE':					
					console.log("DELETE");	
					break;
			};
			
			response.end();
		};
		
	});
	
	
};

punchy.socketConnectionCB = function (socket) {

};

punchy.socketDisconnectCB = function () {
	
};

//called when a message is received from ANY group, use groupId(group name) to differentiate
punchy.messageCB = function (data, groupId) {
	parse.log("Received message from: " + groupId);
}

console.log('Server running at http://127.0.0.1:80/');