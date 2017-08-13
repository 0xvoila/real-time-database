var bodyParser = require('body-parser')
var http = require('http');
var express = require('express');
var md5 = require('md5')
var async = require('async');
var helper = require('../helper.js');
var database = require('../database.js');
var Tree = require('../tree.js')
var Node = require("../node.js")
var redis = require('socket.io-redis');
var MongoClient = require('mongodb').MongoClient;
//var url = 'mongodb://root:2June1989!@voila-cluster-shard-00-00-45vfv.mongodb.net:27017,voila-cluster-shard-00-01-45vfv.mongodb.net:27017,voila-cluster-shard-00-02-45vfv.mongodb.net:27017/test?ssl=true&replicaSet=voila-cluster-shard-0&authSource=admin'
var url = 'mongodb://voila:246810aa@lamppost.2.mongolayer.com:10758,lamppost.3.mongolayer.com:10728/firebase?replicaSet=set-554218a44ec6c0c54f000fdd'
//var url = 'mongodb://root:2June1989!@hesignburg-cluster-shard-00-00-45vfv.mongodb.net:27017,hesignburg-cluster-shard-00-01-45vfv.mongodb.net:27017,hesignburg-cluster-shard-00-02-45vfv.mongodb.net:27017/test?ssl=true&replicaSet=hesignburg-cluster-shard-0&authSource=admin'


var app = express();
var mongodb = null;
var server = http.createServer(app);
// Pass a http.Server instance to the listen method
var io = require('socket.io').listen(server);
io.adapter(redis({ host: 'localhost', port: 6379 }));

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
    console.log(data)
    io.of("/").adapter.to(req.body.connection).emit("new_data", data);
    res.send({});
});

app.post("/push", function(req,res){

    var helperObj = helper();
    var objectId = helperObj.getObjectId()
    var firebaseReference = req.body.reference + "/" + objectId;
    var body = req.body.body

    var result = helperObj.parseJsonToFindAbsolutePath(firebaseReference,body)

    var myTree = new Tree()
    var rootNode = new Node()
    rootNode.parent = null;
    rootNode.data.key = "/"
    var json = myTree.toJson(rootNode,result)
    var rootNode = new Node()
    rootNode.parent = null;
    myTree.toTree(rootNode,json["/"],[])

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
          res.send(result)
        }
      })
})


app.post("/get", function(req,res){

    var firebaseReference = req.body.data_url;
    var queryFilter =  {};
    var limit =  {}
    var myTree = new Tree()
    async.waterfall([function(callback){
            database.createSnapshot(mongodb,firebaseReference, queryFilter, limit, callback)

    }], function(error, result){
        if(error){
          console.log("error" + error)
        }
        else{
          var rootNode = new Node()
          rootNode.parent = null;
          rootNode.data.key = "/"
          var result = myTree.toJson(rootNode,result)
          res.send(result)
        }
    })
})

// Handle connection
io.on('connection', function (socket) {
    socket.on('join_room', function (data) {
        var connection = md5(data.absolute_path + data.event_type)
        io.of("/").adapter.remoteJoin(socket.id,connection, function(error, result){
            console.log("joined room")
        });
        // now store room in database so that it can access by other
    });
});
