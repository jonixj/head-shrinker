var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var patientService = require('http').createServer(app);
var shrinkService = require('http').createServer(app);

patientService.path = 'patient';
var patientWebSocketServer = require('socket.io')(patientService);
var patientPort = 4001;
var shrinkServer = 'http://10.59.1.206:3000/johan';
var sockClient = require('socket.io-client');
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app
		.use('/bower_components', express.static(__dirname
				+ '/../bower_components'));
app.use('/assets', express.static(__dirname + '/../assets'));

patientService.listen(patientPort, function() {
	console.log('Listening on port %d', patientPort);
});

var johanSocket = sockClient.connect(shrinkServer, {
	reconnect : true,
	reconnectionDelay : 15000
});

var patientSessionMap = {};

johanSocket.on('connect_error', function(object) {
	var args = Array.prototype.slice.apply(arguments);
	console.log('Client failed to connect to Johan\'s server ', args);
});

johanSocket.on('session-started', function(msg) {
	var userName = msg.userName;
	var shrinkName = msg.shrinkName;
	console.log('session started ,', userName);
	var patientSocket = patientSessionMap[userName];
	patientSocket.emit('started', {
		'userName' : userName,
		'shrink' : shrinkName
	});
});

johanSocket.on('ping', function(msg) {
	console.log('Got pinged');
	patientWebSocketServer.emit('pong', msg);
});

johanSocket.on('message', function(msg) {
	var patient = msg.patient;
	var text = msg.text;
	console.log('Received %s for %s', text, receiver);
	var patientSocket = patientSocketMap[patient];
	patientSocket.emit('message', text);
});

patientWebSocketServer.on('connection', function(socket) {
	console.log('Client connected');

	socket.on('disconnect', function(object) {
		if (socket.hasOwnProperty('patient')) {
			console.log('Clearing session of ', socket.patient);
			delete patientSessionMap[socket.patient];
			delete socket.patient;
		}
	});

	socket.on('start', function(msg) {
		socket.emit('started', {
			'shrink' : 'Dr Ruth'
		});
		var userName = msg.userName;
		console.log('session started ,', userName);
		johanSocket.emit('start-session', {
			"patient" : userName
		});
		patientSessionMap[userName] = socket;
		socket.patient = userName;
	});

	socket.on('message', function(text) {
		console.log('Received %s for %s', text, receiver);
		johanSocket.emit('patient-message', {
			"patient" : userName,
			"text" : text
		});
	});
});

johanSocket.on('connection', function(socket) {
	console.log('Client connected');
});

// Test blocks
app.post('/patient/send/', function(req, res) {
	socket = sockClient.connect(shrinkServer, {
		reconnect : true,
	});
	socket.on('connect_error', function(object) {
		console.log('Client failed to connect ', object);
	});
	message = req.query;
	socket.emit('message', message);
	console.log('Sent %s to %s', message, shrinkServer);
	res.send('Message passed on');
});

// Simple test
app.get('/test', function(req, res) {
	socket = sockClient.connect(shrinkServer, {
		reconnect : true
	});
	socket.emit('shrinkMessage', "Hej Johan!");
	console.log('Sent to %s', shrinkServer);
	res.send('Sent to Johan.');
});
