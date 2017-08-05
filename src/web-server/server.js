var bodyParser = require('body-parser')
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
    res.sendFile(__dirname + '/index.html');
});

// Expose the node_modules folder as static resources (to access socket.io.js in the browser)
app.use('/', express.static(__dirname + '/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.post("/updates", function(req, res) {
    var data = {"abs_path" : req.body.abs_path,"event_type":req.body.event_type}
    io.to(req.body.abs_path).emit("new_data", data);
    res.send({});
});


app.get("/room", function(req, res, next) {

});


// Handle connection
io.on('connection', function (socket) {
    socket.on('join_room', function (data) {
        socket.join(data.abs_path);
        // now store room in database so that it can access by other
    });
});
