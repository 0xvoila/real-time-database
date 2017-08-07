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

  this.addChildNode = function(parentNode, childNode){
    parentNode.children.push(childNode);
    childNode.parent = parentNode;
    return this
  },

  this.deleteChildrenOfParentNode = function(parentNode){

  },
  this.deleteNodeById = function(node){

  },

  this.getNodeById = function(nodeId){

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



var myTree = new Tree();

var rootNode = new Node();
rootNode.data.path = "/"

var oneNode = new Node()
oneNode.data.path = "/one"

var twoNode = new Node()
twoNode.data.path = "/two"

var threeNode = new Node()
threeNode.data.path = "/three"

var fourNode = new Node()
fourNode.data.path = "/four"

var fiveNode = new Node()
fiveNode.data.path = "/five"

var sixNode = new Node()
sixNode.data.path = "/six"

var sevenNode = new Node()
sevenNode.data.path = "/seven"

myTree.addChildNode(rootNode,oneNode)
myTree.addChildNode(rootNode,twoNode)
myTree.addChildNode(rootNode,threeNode)
myTree.addChildNode(twoNode,fourNode)
myTree.addChildNode(twoNode,fiveNode)
myTree.addChildNode(fourNode,sixNode)
myTree.addChildNode(rootNode,sevenNode)

//myTree.depthFirst(rootNode)

myTree.breadthFirst(rootNode)




