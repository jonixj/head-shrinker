var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 4000;

app.use(bodyParser.json());

server.listen(port, function() {
	console.log('Listening on port %d', port);
});

io.on('connection', function(socket) {
	socket.on('ping', function(msg) {
		io.emit('pong', msg);
	});
});

app.use(express.static(__dirname + '/public'));
