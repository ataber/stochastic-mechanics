var ReactionSimulation = (function () {
  function performReactions () {
    currentStep = currentStep + 1;
    transitions.map(function (transition) {
      if (Math.random() < (calculateFiringProbability(transition))) {
        fireReaction(transition);
      };
    });
  };

  function fireReaction (transition) {
    transition.lastFired = currentStep;

    // Update quantities

    var reactantRequirements = groupQuantitiesByNode(getReactants(transition.id));

    reactantRequirements.forEach(function (requirement) {
      var reactant = requirement.node;
      reactant.topRightLabel = reactant.topRightLabel - requirement.quantity;
    });

    var productOutputs = groupQuantitiesByNode(getProducts(transition.id));
    productOutputs.forEach(function (productOutput) {
      var product = productOutput.node;
      product.topRightLabel = product.topRightLabel + productOutput.quantity;
    });

    instance.update({ skipLayout: true });

    // Render animation

    instance.selector.traverseIncomingEdges(
      { id: transition.id },
      { keepStroke: false }
    );

    //setTimeout(function () { instance.selector.highlightNode({id: transition.id, duration: 500})}, 300);

    setTimeout(function () {
      instance.selector.traverseOutgoingEdges(
        { id: transition.id },
        { keepStroke: false }
    )}, 300);
  };

  function checkSufficientReactants (transitionId) {
    var reactionRequirements = groupQuantitiesByNode(getReactants(transitionId));
    var returnValue = true;

    reactionRequirements.forEach(function (requirement) {
      if (requirement.node.topRightLabel < requirement.quantity) {
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
        nodes[cur.id] = {node: cur, quantity: 0};
        newArr.push(nodes[cur.id]);
      }
      nodes[cur.id].quantity = nodes[cur.id].quantity + 1;
    }
    return newArr;
  }

  var reactionInterval = null;
  var currentStep = 0;
  var transitions = [];

  function toggleReactions () {
    if (reactionInterval == null) {
      reactionInterval = setInterval(performReactions, 500);

      $("#start-reactions").val("Stop Reactions");

      transitions.map(function (transition) {
        transition.lastFired = currentStep;
      });

      GraphManipulation.removeCallbacks(); // No changing the graph while it's reacting, for UI sake

      currentStep = 0; // Reset current timestep
    } else {
      clearInterval(reactionInterval);
      reactionInterval = null;
      GraphManipulation.registerCallbacks();
      $("#start-reactions").val("Start Reactions");
    }
  };

  function calculateFiringProbability (transition) {
    if (!checkSufficientReactants(transition.id)) {
      return 0;
    }

    // Rate depends on concentration of reactants
    var reactants = getReactants(transition.id);
    var reactantConcentrations = reactants.map(function (node) {
      return node.topRightLabel;
    });

    var perMinuteRate = transition.rate / 120; // 120 because each step is one half second long.
    reactantConcentrations.push(perMinuteRate);
    var rate = reactantConcentrations.reduce(function (p,c) {
      return p * c;
    });

    return (-Math.log(Math.random())/rate) * 100;
  };

  function addTransition (props) {
    transitions.push(props);
  };

  function resetTransitions () {
    transitions = [];
  };

  function getReactants (transitionId) {
    var incoming = instance.graph.getIncomingEdges({id: transitionId});
    return incoming.map(function (edge) {
      return edge.source;
    });
  };

  function getProducts (transitionId) {
    var outgoing = instance.graph.getOutgoingEdges({id: transitionId});
    return outgoing.map(function (edge) {
      return edge.target;
    });
  };

  return {
    toggleReactions: toggleReactions,
    addTransition: addTransition,
    resetTransitions: resetTransitions,
  }
})();
