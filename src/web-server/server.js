var bodyParser = require('body-parser')
var http = require('http');
var express = require('express');
var md5 = require('md5')
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
    var data = {"abs_path" : req.body.data.abs_path,"event_type":req.body.data.event_type}
    console.log(data)
    io.to(req.body.connection).emit("new_data", data);
    res.send({});
});


app.get("/room", function(req, res, next) {

});


// Handle connection
io.on('connection', function (socket) {
    socket.on('join_room', function (data) {
        var connection = md5(data.abs_path + data.event_type)
        socket.join(connection);
        // now store room in database so that it can access by other
    });
});
