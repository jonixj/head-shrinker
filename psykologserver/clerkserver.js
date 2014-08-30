var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var wackoServer = require('http').createServer(app);
var wackoIo = require('socket.io')(wackoServer);
var clerkServer = require('http').createServer(app);
var clerkIo = require('socket.io')(clerkServer);
app.use(bodyParser.json());
wackoServer.path = "/johan";

wackoServer.listen(wackoPort = 3000);
wackoServer.listen(clerkPort = 4002);

var wackoSessions = [];
var clerkSessions = [];

wackoIo.on('connection', function (socket) {
    socket.on('message', function (msg) {
        wackoMessageWasReceived(msg, socket);
    });
    socket.on('start-session', function (msg) {
        wackoWasConnected(msg);
        match();
    });
    socket.on('disconnect', function () {
        socket.ondisconnect();
    });
});
clerkIo.on('connection', function (socket) {
    socket.on('message', function (msg) {
        clerkMessageWasReceived(msg, socket);
    });
    socket.on('start', function (msg) {
        clerkWasConnected(msg);
        match();
    });
    socket.on('disconnect', function () {
        socket.ondisconnect();
    });
});

var match = function () {
    if (wackoSessions.length > 0 && clerkSessions.length > 0) {
        var wackoSession = wackoSessions.pop();
        var clerkSession = clerkSessions.pop();

        clerkSession.onMessage = function (msg) {
            wackoSession.socket.emit(msg);
        };
        wackoSession.onMessage = function (msg) {
            clerkSession.socket.emit(msg);
        };
        wackoSession.messages.forEach(function (msg) {
            clerkSession.socket.emit(msg);
        });
        wackoSession.onDisconnect = function(){
            clerkSession.socket.emit("Din klient stack");
            clerkSessions.push(clerkSession);
        };
        clerkSession.onDisconnect = function(){
            clerkSessions.push(clerkSession);
        };
    }
};

var wackoWasConnected = function (msg, socket) {
    socket.emit("session-started", "OK!");
    var name = msg.data.username;
    var session = {username: name, socket: socket, messages: []};
    session.onMessage = function (msg) {
        session.messages.push(msg);
    };
    session.onDisconnect = function () {
        delete wackoSessions[socket.id];
    };
    wackoSessions[socket.id] = session;
};

var clerkWasConnected = function (msg, socket) {
    socket.emit("session-started", "OK!");
    var name = msg.data.username;
    var session = {username: name, socket: socket, messages: []};
    session.onMessage = function (msg) {
        socket.emit("session-started", "Väntar på jobb");
    };
    session.onDisconnect = function () {
        delete clerkSessions[socket.id];
    };
    clerkSessions[socket.id] = session;
};

var wackoMessageWasReceived = function (msg, socket) {
    var storedSession = wackoSessions[socket.id];
    storedSession.onMessage();
};

var clerkMessageWasReceived = function (msg, socket) {
    var storedSession = clerkSessions[socket.id];
    storedSession.onMessage(msg);
};
