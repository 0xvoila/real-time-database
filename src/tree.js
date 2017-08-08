var ObjectID = require('mongodb').ObjectID;

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

  this.toTree = function(node, json, rootKey){
    for(var key in json){

      var newNode = new Node()
      newNode.parent = node;

      if(typeof(json[key]) == "object"){
        newNode.data.key = rootKey.join("") + "/" +  key
        newNode.data.value = null
      }
      else {
        newNode.data.key = rootKey.join("") +  "/" + key ;
        newNode.data.value = json[key]
      }

      node.children.push(newNode)
      node = newNode;

      if(typeof(json[key]) == "object"){
        rootKey.push( "/" + key)
        this.toTree(node,json[key],rootKey)
      }
    }

    rootKey.pop()

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
  },

  this.depthFirst = function(node){

    console.log(node.data)
    for(var i =0; i< node.children.length;i++){
        this.depthFirst(node.children[i])
    }

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
myTree.depthFirst(rootNode)



