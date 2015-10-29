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

$("#add-species").on("submit", GraphManipulation.submitSpecies);
$("#add-transition").on("submit", GraphManipulation.submitTransition);
$("#start-reactions").on("click", ReactionSimulation.toggleReactions);
$("#preset-select").on("change", ReactionPresets.submitReaction)

ReactionPresets.changeReaction("water");
