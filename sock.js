var sock = function () {
	
}

var parse = require('./parse').parse;

sock.initialize = function (io,groups,obj) {
	sock.currSockets = {};
	sock.groups = groups;
	sock.obj = obj;
	sock.events = {};
	sock.messageCB = obj.onMessage;
	sock.io = io;

	io.configure(function(){
		io.enable('browser client minification');  // send minified client
		io.enable('browser client etag');          // apply etag caching logic based on version number
		io.enable('browser client gzip');          // gzip the file
		io.set('log level', 1);                    // reduce logging
		io.set('transports', [                     // enable all transports (optional if you want flashsocket)
			'websocket'
		  , 'flashsocket'
		  , 'htmlfile'
		  , 'xhr-polling'
		  , 'jsonp-polling'
		]);
	});
	
	io.sockets.on('connection', sock.connectionCB.bind(this));		
}

sock.connectionCB = function (socket) {
	sock.currSockets[socket.id] = {socket:socket};	
	
	parse.log("Connected Socket:",socket.id)
		
	//onConnect callback
	sock.obj.onConnect(socket);
	
	//adds all messaging events
	//passes group in callback
	for (group in sock.groups) {
		socket.on(group, function (data) {sock.messageCB(data,group)});
	}	
	socket.on("instanceName", function (data) { 
		sock.currSockets[socket.id].name = data.name;
		sock.currSockets[name] = socket.id;
	});
	socket.on('disconnect', sock.disconnectCB.bind(this,socket))
}

sock.getSocketID = function (name) {
	return sock.currSockets[name];
}

sock.disconnectCB = function (socket) {
	parse.log("Disconnected Socket:",socket.id)
	
	if (sock.currSockets && sock.currSockets[socket.id]) 
	{
		delete sock.currSockets[sock.currSockets[socket.id].name];
		delete sock.currSockets[socket.id];
	}
}

//emits to all sockets
sock.emit = function (group,obj,socketId,device) {
	if (socketId === undefined) {
		parse.log("emitting: " + group, 'all sockets');
		var keyFound = false;
		
		for (key in sock.currSockets) {
			keyFound = true;
			sock.currSockets[key].socket.emit(group,obj);
		}
		
		//no sockets yet
		//emit when there is a connection
		if (device) {
			sock.io.sockets.on('connection', function (socket) {
				sock.events[device] = sock.events[device] || [];
				sock.events[device].push({event: 'connection', listener: arguments.callee});
				parse.log('emitting old data',socket.id);
				socket.emit(group,obj)
			});	
		}
	} else {
		parse.log("emitting: " + group, 'socket:',socketId);
		sock.currSockets[socketId].socket.emit(group,obj);
	}
}

//needs to be tested
sock.removeDeviceListeners = function (device) {
	for (d in sock.events[device]) {
		sock.io.sockets.removeListener(sock.events[device][d].event,sock.events[device][d].listener);
	}
}

exports.sock = sock;