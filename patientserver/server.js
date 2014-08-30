var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var patientService = require('http').createServer(app);
var shrinkService = require('http').createServer(app);

patientService.path='patient';
var patientWebSocketServer = require('socket.io')(patientService);
var shrinkWebSocketServer = require('socket.io')(shrinkService);
var shrinkPort = 4000;
var patientPort = 4001;
var shrinkServer = 'http://10.59.1.206:3000/johan';
var sockClient = require('socket.io-client');
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/../bower_components'));
app.use('/assets',  express.static(__dirname + '/../assets'));

shrinkService.path='shrink';
shrinkService.listen(shrinkPort, function() {
	console.log('Listening on port %d', shrinkPort);
});
patientService.listen(patientPort, function() {
	console.log('Listening on port %d', patientPort);
});

var johanSocket = sockClient.connect(shrinkServer, {
	reconnect : true,
});
johanSocket.on('connect_error', function(object) {
	var args = Array.prototype.slice.apply(arguments);
	console.log('Client failed to connect to Johan\'s server ', args);
});

patientWebSocketServer.on('connection', function(socket) {
	console.log('Client connected');
	socket.on('start', function(msg) {
		socket.emit('started', {'shrink' : 'Dr Ruth'});
		var userName = msg.userName;
		console.log('session started ,', userName);
		patientWebSocketServer.emit('started');
		johanSocket.emit('start-session', {"patient" : userName});
	});	
	socket.on('message', function(msg) {
		receiver = msg.receiver;
		text = msg.text;
		console.log('Received %s for %s', text, receiver);
		johanSocket.emit('patient-message', {"patient" : userName, "text" : text});
	});
});

patientWebSocketServer.on('connection', function(socket) {
	console.log('Client connected');
	socket.on('start', function(msg) {
		userName = msg.userName;
		console.log('session started ,', userName);
		patientWebSocketServer.emit('started');
	});	
	socket.on('ping', function(msg) {
		console.log('Got pinged');
		patientWebSocketServer.emit('pong', msg);
	});
	socket.on('message', function(msg) {
		receiver = msg.receiver;
		text = msg.text;
		console.log('Received %s for %s', text, receiver);
	});
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
