var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(bodyParser.json());
var anders = require('socket.io-client');
var andersSocket = anders.connect("10.59.1.182:4000/anders", {reconnect: true})

port = 3000;
messages = [];
app.use(bodyParser.json());
server.path = "/johan";
server.listen(port, function () {
    console.log("hej")
});

io.on('connection', function (socket) {
    socket.on('message', function (msg) {
        messages.push(msg);
        console.log(msg);
        if (1 == 1)
            clientMessageWasPosted(msg);
        else
            clerkMessageWasPosted(msg);
    });

    var PassMessageToClerk = function (msg) {
        socket.emit("Detta är en fråga till psykologen")
    };

    var passMessageToClient = function (msg) {
        andersSocket.emit("Här kommer ett svar till patienten");
    }

    //Event
    var clientMessageWasPosted = function (msg) {
        PassMessageToClerk(msg);
    };
    //Event
    var clerkMessageWasPosted = function (msg) {
        passMessageToClient(msg);
    };
});


