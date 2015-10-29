var GraphManipulation = (function () {
  function submitSpecies (e) {
    e.preventDefault();
    var name = $(this).find("#species-name").val();
    var quantity = $(this).find("#species-quantity").val();
    addSpecies(name, quantity);
  }

  function addSpecies (name, quantity) {
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

  function submitTransition (e) {
    e.preventDefault();
    var rate = $(this).find("#transition-rate").val();
    addTransition(rate);
  }

  function addTransition (rate) {
    var newId = getNextId();
    instance.graph.addNode({id: newId, label: "", r: 20, fill: "green", topRightLabel: rate});
    updateWithCallbacks();
    ReactionSimulation.addTransition({id: newId, rate: rate});
    return newId;
  }

  function getNextId () {
    var maxId = 0;

    instance.graph.nodes.forEach(function (node) {
      if (node.id > maxId) {
        maxId = node.id;
      }
    });

    return maxId + 1;
  }

  selectedId = null;
  function selectIncidentNode (node) {
    selectedId = node.id;
    findNode(selectedId).select("circle").transition().style("fill", "orange")
    var selected = instance.graph.getNode({ id: node.id })
    selected.topLeftLabel = "X"
    updateWithCallbacks(true);
  };

  function findNode (nodeId) {
    return d3.select("#greuler-" + nodeId);
  };

  function nodeType (nodeId) {
    if (findNode(nodeId).select(".label").text() == "") {
      return "transition";
    } else {
      return "species";
    }
  };

  function selectDestinationNode (node) {
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

  function removeSelectedNode () {
    if (selectedId == null) {
      return;
    }

    var nodeId = deSelectNode();
    instance.graph.removeNode({id: nodeId});
    updateWithCallbacks();
  }

  function deSelectNode () {
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

    updateWithCallbacks(true);
    return returnId;
  };

  function addArrow (src, dest) {
    instance.graph.addEdge({source: src, target: dest});
  };

  function registerCallbacks () {
    if (selectedId != null) {
      d3.select("svg").on("click", deSelectNode);
      d3.selectAll(".node").on("click", selectDestinationNode);
      d3.selectAll(".outer-top-left").on("click", removeSelectedNode);
    } else {
      d3.select("svg").on("click", function () {});
      d3.selectAll(".node").on("click", selectIncidentNode);
    }
  };

  function removeCallbacks () {
    d3.selectAll(".node").on("click", function () {});
  };

  function updateWithCallbacks (skipLayout) {
    instance.update({skipLayout: skipLayout});
    // For some reason this doesn't work unless we wait a bit...
    setTimeout(registerCallbacks, 500);
  };

  return {
    submitSpecies: submitSpecies,
    submitTransition: submitTransition,
    addSpecies: addSpecies,
    addTransition: addTransition,
    addArrow: addArrow,
    updateWithCallbacks: updateWithCallbacks,
    registerCallbacks: registerCallbacks,
    removeCallbacks: removeCallbacks,
  };
})();
