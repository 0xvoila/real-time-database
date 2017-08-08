var ObjectID = require('mongodb').ObjectID;
var async = require('async');

var getObjectId = function(){
    var ObjectId = new ObjectID();
    ObjectId = ObjectId.toHexString()
    return ObjectId
  }

var Node = function(){
    this.id = getObjectId()
    this.data = {};
    this.parent = null;
    this.children = []
  }


var Tree = function(){

  this.rootNode = new Node()
  this.rootNode.parent = null;
  var _this = this;

  this.toTree = function(node, json, pathKeys){
    for(var key in json){

      var newNode = new Node()
      newNode.parent = node;

      if(typeof(json[key]) == "object"){
        newNode.data.key = pathKeys.join("") + "/" +  key
        newNode.data.value = null
      }
      else {
        newNode.data.key = pathKeys.join("") +  "/" + key ;
        newNode.data.value = json[key]
      }

      node.children.push(newNode)
      node = newNode;

      if(typeof(json[key]) == "object"){
        pathKeys.push( "/" + key)
        this.toTree(node,json[key],pathKeys)
      }
    }

    pathKeys.pop()

  }

  this.addChildNode = function(parentNode, childNode){
    parentNode.children.push(childNode);
    childNode.parent = parentNode;
    return this
  },

  this.traverseNodeParents = function(node){

    if(node.parent != null){
      console.log(node.parent.data)
      this.traverseNodeParents(node.parent)
    }
    return
  },

  this.traverseNodeChildren = function(node){

    for(var i=0; i<node.children.length;i++){
      console.log(node.children[i].data)
    }
  }

  this.processNode = function(dbConnection,node, _callback){
    console.log("processing " + node.data.key)
    _callback(null);
    // go through all nodes in depth first order and see if they exits in mongo. If not then updated their events accordingly

  }

  this.depthFirstProcessing = function(dbConnection, node, _callback){

    async.series([function(callback){

      _this.processNode(dbConnection, node, callback)

    }, function(callback){

        async.each(node.children, function(child, callback){
          _this.depthFirstProcessing(dbConnection,child, callback)

        }, function(error, result){
              if (error){
                callback(error)
              }
              else{
                callback(null,result)
              }
        })

    }], function(error, result){
          if(error){
            _callback(error)
          }
          else{
            _callback(null,result)
          }
    })

    return
  }

  this.breadthFirst = function(node){

    for(var i =0; i< node.children.length;i++){
        console.log(node.children[i].data)
    }
    for(var i =0; i< node.children.length;i++){
        this.breadthFirst(node.children[i])
    }
    return

  }
}


var json2 = { "happy" : true, "school":{"class":{"name":"amit","addresss":{"address1":"A-203", "address2":"G-14"}}}, "principal":"amit"}

var myTree = new Tree()
var rootNode = new Node()
rootNode.parent = null;
myTree.toTree(rootNode,json2, [])
myTree.depthFirstProcessing("",rootNode, function(error, result){
  if(error){
    console.log(error)
  }
  else{
    console.log("all nodes processed")
  }
})



