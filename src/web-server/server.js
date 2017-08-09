var bodyParser = require('body-parser')
var http = require('http');
var express = require('express');
var md5 = require('md5')
var async = require('async');
var aws = require('aws-sdk');

var helper = require('../helper.js');
var database = require('../database.js');
var {Tree,Node} = require('../tree.js')
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://root:2June1989!@voila-cluster-shard-00-00-45vfv.mongodb.net:27017,voila-cluster-shard-00-01-45vfv.mongodb.net:27017,voila-cluster-shard-00-02-45vfv.mongodb.net:27017/test?ssl=true&replicaSet=voila-cluster-shard-0&authSource=admin'


var app = express();
var mongodb = null;
var server = http.createServer(app);
// Pass a http.Server instance to the listen method
var io = require('socket.io').listen(server);

// The server should start listening
server.listen(80);

var options ={poolSize:100}
MongoClient.connect(url,options,function(error,connection){
  if(error){
    console.log(error)
  }
  else{
    mongodb = connection
  }

})


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
    var data = {"abs_path" : req.body.absolute_path, "data_url" : req.body.data_url}
    console.log(req.body.connection)
    io.to(req.body.connection).emit("new_data", data);
    res.send({});
});

app.post("/push", function(req,res){

    console.log("client value " + client)
    context.callbackWaitsForEmptyEventLoop = false;
    var helperObj = helper();
    var objectId = helperObj.getObjectId()
    var firebaseReference = "/messages";
    var json = req.body
    var y = {}
    y[objectId] = json
    var v = {}
    v["messages"] = y
    var myTree = new Tree()
    var rootNode = new Node()
    rootNode.parent = null;

    myTree.toTree(rootNode,v,[])

    // delete subtree at reference
    async.series([
      function(callback){
        myTree.depthFirstProcessing(mongodb,rootNode, callback);
      }, function(callback){
        myTree.breadthFirstEventTrigger(rootNode,callback)
      }],
      function(error, result){
        if(error) {
          console.log("error" + error)
          return
        }
        else {
          console.log("all done baby")
        }
      })
})

// Handle connection
io.on('connection', function (socket) {
    socket.on('join_room', function (data) {
        var connection = md5(data.abs_path + data.event_type)
        socket.join(connection);
        // now store room in database so that it can access by other
    });
});
