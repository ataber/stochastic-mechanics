module ReactionNetwork (Model, Action, init, update, view, main) where

import Easing exposing (ease, easeOutBounce, float)
import Effects exposing (Effects)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode as Json
import StartApp

port addSpecies : Signal Species
port addTransition : Signal Transition
port addEdge : Signal Edge

-- MODEL

type alias Model =
    { species : SpeciesList,
      transitions : TransitionList,
      edges : EdgeList
    }

type Addable = Species | Transition | Edge

type alias Species =
    { id : Int, label : String, quantity : Int }

type alias Transition =
    { id : Int, rate : Float }

type alias Edge =
    { sourceId : Int, destId : Int }

type alias SpeciesList = List Species
type alias TransitionList = List Transition
type alias EdgeList = List Edge

init : (Model, Effects Action)
init =
  ( { species = [], transitions = [], edges = [] }
  , Effects.none
  )

-- UPDATE

type Action
    = AddSpecies Species
    | AddTransition Transition
    | AddEdge Edge


update : Action -> Model -> (Model, Effects Action)
update msg model =
  case msg of
    AddSpecies species ->
      let newSpecies = model.species ++ [species]
      in
        ({ model | species <- newSpecies }, Effects.none)

    AddTransition transition ->
      let newTransitions = model.transitions ++ [transition]
      in
        ({ model | transitions <- newTransitions }, Effects.none)

    AddEdge edge ->
      let newEdges = model.edges ++ [edge]
      in
        ({ model | edges <- newEdges }, Effects.none)


-- VIEW
nextId : Model -> Addable -> Int
nextId model addable =
  let ids = List.map (\x -> x.id) model.species
  in
    case List.maximum ids of
      Just id -> id + 1
      Nothing -> 1

stopFormOptions : () -> Options
stopFormOptions =
  { preventDefault = True, stopPropagation = False }

view : Signal.Address Action -> Model -> Html
view address model =
  div [ class "row" ]
    [ div [ class "six columns" ]
      [ Html.form [
        id "add-species",
        onWithOptions "submit"
          stopFormOptions,
          Json.value (\x -> Signal.message address (AddSpecies { id = nextId model Species, label = "abc", quantity = 0 }))
        ]
        [ input [ type' "text", id "species-name", placeholder "New Species Name", style [("margin-right", "5px")] ] []
        , input [ type' "submit", class "button", value "Add New Species" ] []
        , div [] [text (toString model) ]
        ]
      ]
    , div [ class "six columns" ]
      [ Html.form [ id "add-transition" ]
        [ input [ type' "submit", class "button", value "Add New Transition" ] []
        ]
      ]
    ]

-- MAIN

app = StartApp.start
    { init = init
    , update = update
    , view = view
    , inputs = []
  }

main =
  app.html

