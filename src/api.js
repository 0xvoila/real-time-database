var helper = require('./helper.js');
var database = require('./database.js');

   //your object
  var json = {
      //foo:"bar",
      //arr:[1,2,3],
      suboo: {
          foo2:{
            foo3 : "bar4"
          }
      }
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

//setData(",messages",json);

updateData(",messages",json);
