var greuler = window.greuler;

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
  var quantity = $(this).find("#species-quantity").val();
  addSpecies(name, quantity);
}

var addSpecies = function (name, quantity) {
  if (quantity == null) {
    quantity = 0;
  }

  if (name == "") {
    alert("Species need a name!")
    return;
  }
  var newId = getNextId();
  instance.graph.addNode({id: newId, label: name, r: 35, topRightLabel: quantity});
  updateWithCallbacks();
  return newId;
}

var submitTransition = function (e) {
  e.preventDefault();
  var rate = $(this).find("#transition-rate").val();
  addTransition(rate);
}

var addTransition = function (rate) {
  var newId = getNextId();
  instance.graph.addNode({id: newId, label: "", r: 20, fill: "green", topRightLabel: rate});
  updateWithCallbacks();
  transitions.push({id: newId, rate: rate})
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
  if (selectedId == null) {
    return;
  }

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
  updateWithCallbacks();
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

  updateWithCallbacks();
  return returnId;
};

var registerSelectCallback = function () {
  if (selectedId != null) {
    d3.selectAll(".node").on("click", selectDestinationNode);
    d3.selectAll(".outer-top-left").on("click", removeSelectedNode);
  } else {
    d3.selectAll(".node").on("click", selectIncidentNode);
  }
};

var addArrow = function (src, dest) {
  instance.graph.addEdge({source: src, target: dest});
};

function updateWithCallbacks () {
  instance.update();
  // For some reason this doesn't work unless we wait a bit...
  setTimeout(registerSelectCallback, 500);
};

reactionInterval = null;
currentStep = 0;
transitions = [];
function startReactions () {
  reactionInterval = setInterval(performReactions, 100);
  $("#start-reactions").val("Stop Reactions");
  transitions.map(function (transition) {
    transition.lastFired = 0; // Reset the firing timing
    transition.stepsTilFiring = (-Math.log(Math.random())/transition.rate) * 3000;
  });
  currentStep = 0; // Reset current timestep
};

function performReactions () {
  currentStep = currentStep + 1;
  transitions.map(function (transition) {
    if (currentStep - transition.lastFired > transition.stepsTilFiring) {
      fireReaction(transition);
    }
  });
};

function fireReaction (transition) {
  transition.lastFired = currentStep;
  transition.stepsTilFiring = (-Math.log(Math.random())/transition.rate) * 3000;

  incoming = instance.graph.getIncomingEdges({id: transition.id});
  reactionRequirements = groupQuantitiesByNode(incoming.map(function(edge) {
    return { id: edge.source.id, quantity: 1 };
  }));

  if (!checkSufficientReactants(reactionRequirements)) {
    return;
  }

  outgoing = instance.graph.getOutgoingEdges({id: transition.id});
  productOutputs = groupQuantitiesByNode(outgoing.map(function(edge) {
    return { id: edge.target.id, quantity: 1 };
  }));

  reactionRequirements.forEach(function (requirement) {
    var reactant = instance.graph.getNode({id: requirement.id});
    reactant.topRightLabel = reactant.topRightLabel - requirement.quantity;
  });
  productOutputs.forEach(function (productOutput) {
    var product = instance.graph.getNode({id: productOutput.id})
    product.topRightLabel = product.topRightLabel + productOutput.quantity;
  });
  instance.update({ skipLayout: true });

  instance.selector.traverseIncomingEdges(
    { id: transition.id },
    { keepStroke: false }
  );

  instance.selector.highlightNode({id: transition.id});

  setTimeout(function () {
    instance.selector.traverseOutgoingEdges(
      { id: transition.id },
      { keepStroke: false }
    );
  }, 500);
};

function checkSufficientReactants (reactionRequirements) {
  var returnValue = true;
  reactionRequirements.forEach(function (requirement) {
    if (instance.graph.getNode({id: requirement.id}).topRightLabel < requirement.quantity) {
      returnValue = false;
    }
  });

  return returnValue;
};

function groupQuantitiesByNode (orig) {
    var newArr = [],
        nodes = {},
        newItem, i, j, cur;
    for (i = 0, j = orig.length; i < j; i++) {
        cur = orig[i];
        if (!(cur.id in nodes)) {
          nodes[cur.id] = {id: cur.id, quantity: 0};
          newArr.push(nodes[cur.id]);
        }
        nodes[cur.id].quantity = nodes[cur.id].quantity + 1;
    }
    return newArr;
}

function stopReactions () {
  clearInterval(reactionInterval);
  reactionInterval = null;
  $("#start-reactions").val("Start Reactions");
};

function toggleReactions () {
  if (reactionInterval == null) {
    startReactions();
  } else {
    stopReactions();
  }
};

$("#add-species").on("submit", submitSpecies);
$("#add-transition").on("submit", submitTransition);
$("#start-reactions").on("click", toggleReactions);

var water, hydr, oxy, oh, firstT, secondT;
water = addSpecies("H20", 100);
hydr = addSpecies("H", 50);
oxy = addSpecies("O", 50);
oh = addSpecies("OH", 40);
firstT = addTransition(80);
secondT = addTransition(200);
addArrow(hydr, firstT);
addArrow(hydr, secondT);
addArrow(oxy, firstT);
addArrow(firstT, oh)
addArrow(oh, secondT);
addArrow(secondT, water);
updateWithCallbacks();

//elmNetwork = Elm.embed(Elm.ReactionNetwork,
//  document.getElementById("elm"),
//  {
//    addEdge: {sourceId: 0, destId: 1},
//    addTransition: {id: 0, rate: 0.5},
//    addSpecies: {id: 1, label: "h20", quantity: 1}
//  });
