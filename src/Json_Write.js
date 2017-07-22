var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://root:2June1989!@voila-cluster-shard-00-00-45vfv.mongodb.net:27017,voila-cluster-shard-00-01-45vfv.mongodb.net:27017,voila-cluster-shard-00-02-45vfv.mongodb.net:27017/test?ssl=true&replicaSet=voila-cluster-shard-0&authSource=admin'

var getJson = function(json){

    //your object
  var json = {
      //foo:"bar",
      arr:[1,2,3],
      subo: {
          foo2:{
            foo3 : "bar3"
          }
      }
  };


    var record = parseJsonToFindAbsolutePath(json,"");

}

var parseJsonToFindAbsolutePath =  function (json,absolutePath){

  for (var key in json){
    //console.log(key,json[key]);

    // Check if it is nested json
    if(json[key] != null  && Array.isArray(json[key])){
      // if it is arry then handle convert array into json
      // create a new json
      var newJson = {}

      for( var i = 0; i < json[key].length; i ++){
        var timestamp = Math.floor(Math.random() * 100000);
        newJson[timestamp] = json[key][i];
        //console.log(timestamp);
      }
      parseJsonToFindAbsolutePath(newJson,absolutePath + "/" + key);
    }

    else if (json[key] != null && typeof(json[key])=="object"){
     parseJsonToFindAbsolutePath(json[key],absolutePath + "/" + key);
    }

    else {
      console.log(absolutePath + "/" + key,  json[key]);
      // now insert into mongo db
      insertIntoMongo(absolutePath + "/" + key, json[key]);
    }
  }
}

var insertIntoMongo = function(path,value){
  console.log(url);
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
    var myobj = { path: path, value: value };
    db.collection("test").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 record inserted");
      db.close();
    });
  });

}

getJson();


