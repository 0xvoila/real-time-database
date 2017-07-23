var http = require('http');
var express = require('express');
var app = express();

var server = http.createServer(app);
// Pass a http.Server instance to the listen method
var io = require('socket.io').listen(server);

// The server should start listening
server.listen(80);

// Register the index route of your app that returns the HTML file
app.get('/', function (req, res) {
    console.log("Homepage");
    res.sendFile(__dirname + '/index.html');
});

// Expose the node_modules folder as static resources (to access socket.io.js in the browser)
app.use('/static', express.static('node_modules'));

app.post("/updates", function(req, res) {
    console.log(req);
    //io.to(req.body.firebase_reference).emit("foo", req.body.snapshot);
    //res.send({});
});


app.get("/room", function(req, res, next) {

});


// Handle connection
io.on('connection', function (socket) {
    socket.on('join_room', function (data) {
        socket.join(data.firebase_reference);

        // now store room in database so that it can access by other
    });
});
