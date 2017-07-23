// This module contains database functions
var helper = require('./helper.js');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://root:2June1989!@voila-cluster-shard-00-00-45vfv.mongodb.net:27017,voila-cluster-shard-00-01-45vfv.mongodb.net:27017,voila-cluster-shard-00-02-45vfv.mongodb.net:27017/test?ssl=true&replicaSet=voila-cluster-shard-0&authSource=admin'

exports.insertLeaf = function(path,element,value){
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
    var myobj = { abs_path: path, element: element , value: value };
    db.collection("test").insertOne(myobj, function(err, res) {
    if (err) throw err;
    db.close();
  });

  });
}

exports.deleteSubTree = function(reference){
  console.log("delteing sub tree");
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
    var myobj = { abs_path: new RegExp( '^' + reference)};
    db.collection("test").remove(myobj, function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
}

exports.updateLeaf = function(path,element,value){
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
    var queryObj = {abs_path: path, element:element}
    var myobj = { abs_path:path, element:element,value: value };
    console.log(queryObj);
    db.collection("test").updateOne(queryObj,myobj, {upsert:true} ,function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
}

exports.deleteData = function(path,value){
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
    var myobj = { path: path, value: value };
    db.collection("test").updateOne(myobj, function(err, res) {
      if (err) throw err;

      // now create the snapshot of the data
      createSnapshot(res.insertedId,path)
      db.close();
    });
  });
}

exports.createSnapshot = function(path){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var findObj = { abs_path: new RegExp("^" + path)};
    console.log(findObj);
    db.collection("test").find(findObj).snapshot().toArray(function(err, res) {
      if (err) throw err;

      console.log(res);
      db.close();
    });
  });
}

var isLocationAnArray = function(path){
  var arr = [];
  getChildrenAtLocation (path, function(result){
    for( child in result){
      arr.push(child);
    }
    if(isFirebaseArray(arr)){
      return true;
    }
    else {
      return false;
    }
  })
}


var isFirebaseArray = function(arr){

  for(var i=1; i<arr.length;i++)
    {
        if(arr[i-1]>arr[i])
            return false;
    }
    return true;
}
