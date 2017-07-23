var helper = require('./helper.js');
var database = require('./database.js');

   //your object
  var json1 = {
  "users": {
    "alanisawesome": {
      "date_of_birth": "June 23, 1912",
      "full_name": "Alan Turing"
    },
    "gracehop": {
      "date_of_birth": "December 9, 1906",
      "full_name": "Grace Hopper",
    }
  }
};

var json2 = {
    "users": {
      "gracehop": {
        "nick_name" : "loosy"
      }
    }
  };

var json3 = {
    name : "amit",
    className : "second"
  };

var setData = function(firebaseReference, json){

  var flatTree = helper.parseJsonToFindAbsolutePath(firebaseReference,json);
  console.log(flatTree);
  // delete subtree at reference
  database.deleteSubTree(firebaseReference);

   for(var i =0; i< flatTree.length;i++){
     database.insertLeaf(flatTree[i].abs_path,flatTree[i].element,flatTree[i].value);
  }
}

var updateData = function(firebaseReference, json){

  var flatTree = helper.parseJsonToFindAbsolutePath(firebaseReference,json);

   for(var i =0; i< flatTree.length;i++){
     database.updateLeaf(flatTree[i].abs_path,flatTree[i].element,flatTree[i].value);
  }
}

var pushData = function(firebaseReference,json){

  var newJson = helper.convertArrayToJson(json);
  var flatTree = helper.parseJsonToFindAbsolutePath(firebaseReference,newJson);

   for(var i =0; i< flatTree.length;i++){
     database.updateLeaf(flatTree[i].abs_path,flatTree[i].element,flatTree[i].value);
  }
}

//setData(",messages",json1);
//updateData(",messages",json2);
pushData(",messages",json3);
