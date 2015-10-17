var greuler = window.greuler;

var instance = greuler({
  target: '#graph',
  width: 480,
  height: 500,
  data: {
    nodes: [
      {id: 0},
      {id: 1},
      {id: 2},
      {id: 3},
      {id: 4},
      {id: 5}
    ],
    links: [
      {source: 0, target: 1},
      {source: 0, target: 2, directed: true},
      {source: 0, target: 3},
      {source: 1, target: 2, directed: true},
      {source: 4, target: 0},
      {source: 5, target: 0, directed: true},
      {source: 4, target: 5}
    ]
  }
}).update();

var addSpecies = function (e) {
  e.preventDefault();
  var name = $(this).find("#species-name").val();
  addNode(name);
}

var addTransition = function (e) {
  e.preventDefault();
  var maxId = -1;
  instance.graph.nodes.forEach(function (node) {
    if (node.id > maxId) {
      maxId = node.id;
    }
  });
  name = maxId + 1;
  addNode(name);
}

var addNode = function (name) {
  instance.graph.nodes.forEach(function (node) {
    if (node.id == name) {
      alert(name + " is already there! Pick a new name");
      return;
    }
  });

  instance.graph.addNode({id: name});
  instance.update();
  setTimeout(registerSelectCallback, 500);
};

selectedId = null;
var selectIncidentNode = function (node) {
  selectedId = node.id;
  d3.select("#greuler-" + selectedId).select("circle").transition().style("fill", "orange");
  registerSelectCallback();
};

var selectDestinationNode = function (node) {
  var edge = {source: selectedId, target: node.id, directed: true};
  instance.graph.addEdge(edge);
  colorDefault(selectedId);
  selectedId = null;
  instance.update();
  setTimeout(registerSelectCallback, 500);
};

var colorDefault = function (nodeId) {
  d3.select("#greuler-" + nodeId).select("circle").transition().style("fill", "#2980B9");
};

var registerSelectCallback = function () {
  if (selectedId != null) {
    d3.selectAll(".node").on("click", selectDestinationNode);
  } else {
    d3.selectAll(".node").on("click", selectIncidentNode);
  }
};

var updateGraph = function (callback) {
  instance.update();
  callback();
};

$("#add-species").on("submit", addSpecies);
$("#add-transition").on("submit", addTransition);

// For some reason this doesn't work unless we wait a bit...
setTimeout(registerSelectCallback, 500);
