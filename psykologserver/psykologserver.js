var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    server = require('http').createServer(app),
    io = require('socket.io')(server);

app.use(bodyParser.json());

var messages = [];
var port = 3000;

server.listen(port, function () {
    console.log('Listening on port %d', port);
});


var anders = require('socket.io-client');
var socket = anders.connect('10.59.1.182:4000', {reconnect: true});
socket.emit('shrinkMessage', "Hej anders!");
