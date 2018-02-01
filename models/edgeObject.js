var nodeObject = require('./nodeObject.js');
var nodeArray = new Array();
function readNodeFile(cb){
	var fs = require('fs');
	var readline = require('readline');
	var stream = require('stream');

	var instream = fs.createReadStream('./map/SiouxFalls_node.tntp');
	var outstream = new stream;
	var rl = readline.createInterface(instream, outstream);

	rl.on('line', function(line){
		line = line.toString();
	  var arr = line.split(" ")[0].split("\t");
		var nodeId = arr[0];
		var x = arr[1];
		var y = arr[2];
		if(arr[0] != "Node"){
			var node = new nodeObject(nodeId, x, y);
			nodeArray.push(node);
		}
	});

	rl.on('close', function(){
		cb();
	  // for(var i = 0; i < nodeArray.length; i++){
		// 	console.log(nodeArray[i]);
		// }
	});
}
function orientationOfEdge(node1, node2){
	// console.log(node1);
	return nodeArray[node1];
}

module.exports = class edgeObject{
  constructor(edgeId, startNodeId, endNodeId, capacity, length, freeFlowTime, b, power, speedLimit, toll, type){
		if(nodeArray == undefined){
			var cb = ()=>{
			};
			readNodeFile(cb);
		}
		this.edgeId = edgeId;
		this.startNodeId = startNodeId;
		this.endNodeId = endNodeId;
		this.capacity = capacity;
		this.length = length;
		this.freeFlowTime = freeFlowTime;
		this.b = b;
		this.power = power;
		this.speedLimit = speedLimit;
		this.toll = toll;
		this.type = type;
		
		this._orientation = orientationOfEdge(this.startNodeId, this.endNodeId);
		// console.log(this._orientation);

  }

	get orientation(){
		// this._orientation = orientationOfEdge(this.startNodeId, this.endNodeId);
		return this._orientation;
	}
}