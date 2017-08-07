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

  this.deleteSubtree = function(node){
    // get parentNode
    // var parentNode = node.parent;
    // for(var i=0;i<parent.children.length;i++){
    //   if(node == parent.children[i]){
    //     parent.children
    //   }
    // }

    return
  }

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


var rootNode = new Node()
rootNode.parent = null;

var myTree = new Tree();

var jsonToTree = function(node, json){


  for(var key in json){

    var newNode = new Node()
    newNode.parent = node;
    if(typeof(json[key]) == "object"){
      newNode.data.key = key
      newNode.data.value = null
    }
    else {
      newNode.data.key = key;
      newNode.data.value = json[key]
    }

    node.children.push(newNode)
    node = newNode;

    if(typeof(json[key]) == "object"){
      jsonToTree(node,json[key])
    }
  }
}



// var myTree = new Tree();

// var rootNode = new Node();
// rootNode.data.path = "/"
// rootNode.parent = null;

// var oneNode = new Node()
// oneNode.data.path = "/one"

// var twoNode = new Node()
// twoNode.data.path = "/two"

// var threeNode = new Node()
// threeNode.data.path = "/three"

// var fourNode = new Node()
// fourNode.data.path = "/four"

// var fiveNode = new Node()
// fiveNode.data.path = "/five"

// var sixNode = new Node()
// sixNode.data.path = "/six"

// var sevenNode = new Node()
// sevenNode.data.path = "/seven"

// myTree.addChildNode(rootNode,oneNode)
// myTree.addChildNode(rootNode,twoNode)
// myTree.addChildNode(rootNode,threeNode)
// myTree.addChildNode(twoNode,fourNode)
// myTree.addChildNode(twoNode,fiveNode)
// myTree.addChildNode(fourNode,sixNode)
// myTree.addChildNode(rootNode,sevenNode)

//myTree.depthFirst(rootNode)

//myTree.breadthFirst(rootNode)
//myTree.deleteSubtree(fourNode)
//console.log("")
//myTree.breadthFirst(rootNode)

//myTree.traverseNodeParents(fourNode)
//myTree.traverseNodeChildren(fourNode)

var json1 =
  {
    "_id": "5988b84db47cbe7a1bcba559",
    "index": 0,
    "guid": "b3b93e1f-1c06-4a64-89aa-f8af08fec725",
    "isActive": false,
    "balance": "$2,499.40",
    "picture": "http://placehold.it/32x32",
    "age": 26,
    "eyeColor": "blue",
    "name": "Montoya Davenport",
    "gender": "male",
    "company": "EWAVES",
    "email": "montoyadavenport@ewaves.com",
    "phone": "+1 (814) 463-3724",
    "address": "693 Johnson Avenue, Gibbsville, New Jersey, 4956",
    "about": "Cupidatat ut sit et anim aute elit cillum commodo. In ut ipsum deserunt minim laboris minim. Aute magna do occaecat enim anim dolor sint sit ullamco.\r\n",
    "registered": "2016-03-09T11:51:58 -06:-30",
    "latitude": 74.131606,
    "longitude": 124.837197,
    "tags": [
      "ullamco",
      "elit",
      "qui",
      "excepteur",
      "voluptate",
      "nisi",
      "aliquip"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Carlson Hardy"
      },
      {
        "id": 1,
        "name": "Katy Espinoza"
      },
      {
        "id": 2,
        "name": "Lawson Weaver"
      }
    ],
    "greeting": "Hello, Montoya Davenport! You have 3 unread messages.",
    "favoriteFruit": "strawberry"
  }

var json2 = {"school":{"class":{"name":"amit","addresss":{"address1":"A-203", "address2":"G-14"}}}, "principal":"amit"}

jsonToTree(rootNode, json2)
myTree.breadthFirst(rootNode)

