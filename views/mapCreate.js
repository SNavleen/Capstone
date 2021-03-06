var graphObject = require('../models/graphObject.js')
var map = new graphObject();

var dijkstras = require('../models/dijkstras.js')
var dijkstrasGraph = new dijkstras.Graph();

// Dijkstra's
var edgeWeightMap = map.getEdgeWeightMap();
for (var i = 1; i <= Object.keys(edgeWeightMap).length; i++) {
  dijkstrasGraph.addVertex(i, edgeWeightMap[i]);
}

function getCarsOnEdge(edgeId, colNum) {
  return map.getCarsOnEdge(edgeId, colNum);
}

function getNumOfEdges() {
  return map.getNumOfEdges();
}

function getEdgeObject(edgeId) {
  return map.getEdgeObject(edgeId);
}

function getEdgeArray() {
  return map.getEdgeArray();
}

function removeCarFromEdge(carId, edgeId, colNum) {
  return map.removeCarFromEdge(carId, edgeId, colNum);
}

function insertCarToEdge(carId, edgeId, colNum) {
  return map.insertCarToEdge(carId, edgeId, colNum);
}

function getStartNode(edgeId) {
  return map.getStartNode(edgeId);
}

function getEndNode(edgeId) {
  return map.getEndNode(edgeId);
}

function getNumberOfLanesOnEdge(edgeId) {
  return map.getNumberOfLanesOnEdge(edgeId);
}

//console.log(dijkstrasGraph.shortestPath('1', '24').concat(['1']).reverse());

module.exports = {
  dijkstrasGraph,
  getCarsOnEdge,
  getNumOfEdges,
  getEdgeObject,
  getEdgeArray,
  removeCarFromEdge,
  insertCarToEdge,
  getStartNode,
  getEndNode,
  getNumberOfLanesOnEdge
};

// HOW to use map object

// map.insertCarToEdge(1,2,0);
// map.insertCarToEdge(2,2,0);
// map.insertCarToEdge(3,2,0);
//
// map.removeCarFromEdge(2,2,0);
// console.log(map.getCarsOnEdge(2));
// var startNode = map.getStartNode(0);
// var endNode = map.getEndNode(0);
// var arr = map.getEdgeArray();
// var numEdges = map.getNumOfEdges();
// var edgeObj = map.getEdgeObject(0);
// console.log(startNode);
// console.log(endNode);
// console.log(arr);
// console.log(numEdges);
// console.log(edgeObj);