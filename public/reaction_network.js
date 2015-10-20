var greuler = window.greuler;

transitionRadius = 20;
speciesRadius = 35;

var instance = greuler({
  target: '#graph',
  width: 1000,
  height: 1000,
  directed: true,
  data: {
    linkDistance: 150,
    avoidOverlaps: true,
  }
});

var addSpecies = function (e) {
  e.preventDefault();
  var name = $(this).find("#species-name").val();
  if (name == "") {
    alert("Species need a name!")
    return;
  }
  addNode(name);
  update();
}

var addTransition = function (e) {
  e.preventDefault();
  addNode(null);
  update();
}

var addNode = function (name) {
  var maxId = -1;
  instance.graph.nodes.forEach(function (node) {
    if (node.id > maxId) {
      maxId = node.id;
    }
  });

  var color, r;
  if (name == null) {
    color = "green";
    r = transitionRadius;
  } else {
    r = speciesRadius;
  }

  instance.graph.addNode({id: maxId + 1, label: name, r: r, fill: color});
  return maxId + 1;
};

selectedId = null;
var selectIncidentNode = function (node) {
  selectedId = node.id;
  findNode(selectedId).select("circle").transition().style("fill", "orange");
  registerSelectCallback();
};

var findNode = function (nodeId) {
  return d3.select("#greuler-" + nodeId);
};

var nodeType = function (nodeId) {
  if (findNode(nodeId).select(".label").text() == "") {
    return "transition";
  } else {
    return "species";
  }
};

var selectDestinationNode = function (node) {
  if (nodeType(selectedId) == nodeType(node.id)) {
    deSelectNode();
    return;
  };

  addArrow(selectedId, node.id);
  update();
  deSelectNode();
};

var deSelectNode = function () {
  if (selectedId == null) {
    return;
  }

  var color;
  if (nodeType(selectedId) == "transition") {
    color = "green";
  } else {
    color = "#2980B9";
  }

  findNode(selectedId).select("circle").transition().style("fill", color);
  selectedId = null;
  registerSelectCallback();
};

var registerSelectCallback = function () {
  if (selectedId != null) {
    d3.selectAll(".node").on("click", selectDestinationNode);
  } else {
    d3.selectAll(".node").on("click", selectIncidentNode);
  }
};

var addArrow = function (src, dest) {
  instance.graph.addEdge({source: src, target: dest});
};

var update = function () {
  instance.update();
  // For some reason this doesn't work unless we wait a bit...
  setTimeout(registerSelectCallback, 500);
};

$("#add-species").on("submit", addSpecies);
$("#add-transition").on("submit", addTransition);

var water, hydr, oxy, oh, firstT, secondT;
water = addNode("H20");
hydr = addNode("H");
oxy = addNode("O");
oh = addNode("OH");
firstT = addNode(null);
secondT = addNode(null);
addArrow(hydr, firstT);
addArrow(hydr, secondT);
addArrow(oxy, firstT);
addArrow(firstT, oh)
addArrow(oh, secondT);
addArrow(secondT, water);
update();

//elmNetwork = Elm.embed(Elm.ReactionNetwork,
//  document.getElementById("elm"),
//  {
//    addEdge: {sourceId: 0, destId: 1},
//    addTransition: {id: 0, rate: 0.5},
//    addSpecies: {id: 1, label: "h20", quantity: 1}
//  });
