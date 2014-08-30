var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var wackoServer = require('http').createServer(app);
var wackoIo = require('socket.io')(wackoServer);
var clerkServer = require('http').createServer(app);
var clerkIo = require('socket.io')(clerkServer);
app.use(bodyParser.json());
var anders = require('socket.io-client');
var andersSocket = anders.connect("10.59.1.182:4000/anders", {reconnect: true})
app.use(bodyParser.json());
wackoServer.path = "/johan";

wackoServer.listen(wackoPort = 3000);
wackoServer.listen(clerkPort = 4002);

var sessions = [];
var clerks = [];

wackoIo.on('connection', function (socket) {
    socket.on('message', function (msg) {
        wackoMessageWasReceived(msg, socket);
    });
    socket.on('start-session', function (msg) {
        wackoWasConnected(msg);
    });
});
clerkIo.on('connection', function (socket) {
    socket.on('message', function (msg) {
        clerkMessageWasReceived(msg, socket);
    });
    socket.on('start', function (msg) {
        clerkWasConnected(msg);
    });
});

var wackoWasConnected = function (msg, socket) {
    andersSocket.emit("session-started", "OK!");
    var name = msg.data.username;
    var session = {wacko: name, clerk: findAClerk(), socket: socket, messages: []};
    session.onMessage = function (msg) {
        session.messages.push(msg);
    };
    sessions[socket.id] = session;
};

var clerkWasConnected = function(msg, socket){
    socket.username = msg.username;
    clerks[msg.username] = socket;
}

var wackoMessageWasReceived = function (msg, socket) {
    socket.emit("Detta är en fråga till psykologen");
};

var clerkMessageWasReceived = function (msg, socket) {
    var storedSession = sessions[socket.id];
    storedSession.onMessage(msg);
};

var findAClerk = function () {
    return clerks.pop();
}

