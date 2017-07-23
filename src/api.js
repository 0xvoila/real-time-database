var helper = require('./helper.js');
var database = require('./database.js');

   //your object
//   var json = {
//   "users": {
//     "alanisawesome": {
//       "date_of_birth": "June 23, 1912",
//       "full_name": "Alan Turing"
//     },
//     "gracehop": {
//       "date_of_birth": "December 9, 1906",
//       "full_name": "Grace Hopper",
//     }
//   }
// };

var json = {
    "users": {
      "gracehop": {
        "nick_name" : "loosy"
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
