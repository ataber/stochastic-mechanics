var greuler = window.greuler;

transitionRadius = 20;
speciesRadius = 35;

var instance = greuler({
  target: '#graph',
  width: 1450,
  height: 700,
  directed: true,
  data: {
    linkDistance: 120,
  }
});

var submitSpecies = function (e) {
  e.preventDefault();
  var name = $(this).find("#species-name").val();
  addSpecies(name);
}

var addSpecies = function (name) {
  if (name == "") {
    alert("Species need a name!")
    return;
  }
  var newId = getNextId();
  instance.graph.addNode({id: newId, label: name, r: speciesRadius, topRightLabel: ""});
  update();
  return newId;
}

var submitTransition = function (e) {
  e.preventDefault();
  var rate = $(this).find("#transition-rate").val();
  addTransition(rate);
}

var addTransition = function (rate) {
  var newId = getNextId();
  instance.graph.addNode({id: newId, label: "", r: transitionRadius, fill: "green", topRightLabel: rate});
  update();
  return newId;
}

var getNextId = function () {
  var maxId = 0;

  instance.graph.nodes.forEach(function (node) {
    if (node.id > maxId) {
      maxId = node.id;
    }
  });

  return maxId + 1;
}

selectedId = null;
var selectIncidentNode = function (node) {
  selectedId = node.id;
  findNode(selectedId).select("circle").transition().style("fill", "orange")
  var selected = instance.graph.getNode({ id: node.id })
  selected.topLeftLabel = "X"
  instance.update({ skipLayout: true });
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
  deSelectNode();
};

var removeSelectedNode = function () {
  if (selectedId == null) {
    return;
  }

  var nodeId = deSelectNode();
  instance.graph.removeNode({id: nodeId});
  update();
}

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

  findNode(selectedId).select("circle").transition().style("fill", color)
  var selected = instance.graph.getNode({ id: selectedId });
  selected.topLeftLabel = "";

  var returnId = selectedId;
  selectedId = null;

  update();
  return returnId;
};

var registerSelectCallback = function () {
  if (selectedId != null) {
    d3.selectAll("circle").on("click", selectDestinationNode);
    d3.selectAll(".outer-top-left").on("click", removeSelectedNode);
  } else {
    d3.selectAll("circle").on("click", selectIncidentNode);
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

$("#add-species").on("submit", submitSpecies);
$("#add-transition").on("submit", submitTransition);

var water, hydr, oxy, oh, firstT, secondT;
water = addSpecies("H20");
hydr = addSpecies("H");
oxy = addSpecies("O");
oh = addSpecies("OH");
firstT = addTransition(5);
secondT = addTransition(4);
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
