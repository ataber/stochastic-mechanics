var ReactionPresets = (function () {

  var addTransition = GraphManipulation.addTransition;

  function addArrows (nodeArr) {
    nodeArr.forEach(function (nodes) {
      GraphManipulation.addArrow(nodes[0], nodes[1]);
    });
  };

  function addSpecies (nameArr) {
    return nameArr.map(function (name) {
      return GraphManipulation.addSpecies(name, Math.round(Math.random() * 100));
    });
  };

  function submitReaction (e) {
    var functionName = $(e.target).val();
    changeReaction(functionName);
  };

  var presets = {
    water: water,
    sodiumChloride: sodiumChloride,
    lotkaVolterra: lotkaVolterra,
  }

  function changeReaction (functionName) {
    clearGraph();
    setTimeout(function () {
      presets[functionName]();
      GraphManipulation.updateWithCallbacks();
    }, 500);
  };

  function clearGraph() {
    instance.graph.removeNodesByFn(function (n) {
      return true;
    });

    ReactionSimulation.resetTransitions();

    GraphManipulation.updateWithCallbacks();
  };

  function water () {
    var water, hydr, oxy, oh, firstT, secondT;
    var arr = addSpecies(["H20", "H", "O", "OH"]);
    water = arr[0];
    hydr = arr[1];
    oxy = arr[2];
    oh = arr[3];
    firstT = addTransition(80);
    secondT = addTransition(200);
    addArrows([
      [hydr, firstT],
      [hydr, secondT],
      [oxy, firstT],
      [firstT, oh],
      [oh, secondT],
      [secondT, water]
    ]);
  };

  function lotkaVolterra () {
    var pred, prey;
  };

  function sodiumChloride () {
    var c, o2, naoh, co2, nahco3, hcl, h2o, nacl, t1, t2, t3;
    var arr = addSpecies(["C", "O2", "NaOH", "CO2", "NaHCO3", "HCl", "H2O", "NaCl"]);
    c = arr[0];
    o2 = arr[1];
    naoh = arr[2];
    co2 = arr[3];
    nahco3 = arr[4];
    hcl = arr[5];
    h2o = arr[6];
    nacl = arr[7];
    t1 = addTransition(50);
    t2 = addTransition(100);
    t3 = addTransition(40);
    addArrows([
      [c, t1],
      [o2, t1],
      [t1, co2],
      [co2, t2],
      [naoh, t2],
      [t2, nahco3],
      [nahco3, t3],
      [t3, co2],
      [hcl, t3],
      [t3, h2o],
      [t3, nacl],
    ]);
  };

  return {
    changeReaction: changeReaction,
    submitReaction: submitReaction,
  };
})();