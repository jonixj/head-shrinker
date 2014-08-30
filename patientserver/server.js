var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 4000;
var psykServer = 'http://10.59.1.206:3000/johan';
app.use(bodyParser.json());
var sockClient = require('socket.io-client');

server.path='anders';
server.listen(port, function() {
	console.log('Listening on port %d', port);
});

app.use(express.static(__dirname + '/public'));

app.post('/patient/send/', function(req, res) {
	socket = sockClient.connect(psykServer, {
		reconnect : true,
//		connect_error : function(object) {
//			console.log('Client failed to connect');
//		}
	});
	socket.on('connect_error', function(object) {
		console.log('Client failed to connect ', object);
	});
	message = req.query;
	socket.emit('message', message);
	console.log('Sent %s to %s', message, psykServer);
	res.send('Message passed on');
});

app.get('/test', function(req, res) {
	socket = sockClient.connect(psykServer, {
		reconnect : true
	});
	socket.emit('shrinkMessage', "Hej Johan!");
	console.log('Sent to %s', psykServer);
	res.send('Sent to Johan.');
});

io.on('connection', function(socket) {
	console.log('Client connected');
	socket.on('ping', function(msg) {
		console.log('Got pinged');
		io.emit('pong', msg);
	});
	socket.on('message', function(msg) {
		receiver = msg.receiver;
		text = msg.text;
		console.log('Received %s for %s', text, receiver);
	});
});
