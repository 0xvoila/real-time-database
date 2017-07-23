var helper = require('./helper.js');
var database = require('./database.js');

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

var setData = function(firebaseReference, json){

  var flatTree = helper.parseJsonToFindAbsolutePath(firebaseReference,json);
  console.log(flatTree);
  // delete subtree at reference
  database.deleteSubTree(firebaseReference);

   for(var i =0; i< flatTree.length;i++){
     database.insertLeaf(flatTree[i].abs_path,flatTree[i].element,flatTree[i].value);
  }
}

setData(",messages",json);
