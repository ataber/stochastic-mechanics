var ReactionSimulation = (function () {
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

    setTimeout(function () { instance.selector.highlightNode({id: transition.id})}, 200);

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

  var reactionInterval = null;
  var currentStep = 0;
  var transitions = [];

  function toggleReactions () {
    if (reactionInterval == null) {
      reactionInterval = setInterval(performReactions, 100);

      $("#start-reactions").val("Stop Reactions");

      transitions.map(function (transition) {
        transition.lastFired = 0; // Reset the firing timing
        transition.stepsTilFiring = (-Math.log(Math.random())/transition.rate) * 3000;
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

  function addTransition (props) {
    transitions.push(props);
  };

  function resetTransitions () {
    transitions = [];
  };

  return {
    toggleReactions: toggleReactions,
    addTransition: addTransition,
    resetTransitions: resetTransitions,
  }
})();
