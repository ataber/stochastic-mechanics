module ReactionNetwork (Model, Action, init, update, view, main) where

import Easing exposing (ease, easeOutBounce, float)
import Effects exposing (Effects)
import Html exposing (..)
import Html.Events exposing (onClick)
import Time exposing (Time, second)
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

type alias Species =
    { id : Int, label : String, quantity : Int }

type alias Transition =
    { id: Int, rate : Float }

type alias Edge =
    { sourceId: Int, destId: Int }

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
    = AddSpecies
    | AddTransition
    | AddEdge


update : Action -> Model -> (Model, Effects Action)
update msg model =
  case msg of
    AddSpecies ->
      ( model, Effects.none )

    AddTransition ->
      ( model, Effects.none )

    AddEdge ->
      ( model, Effects.none )


-- VIEW

view : Signal.Address Action -> Model -> Html
view address model =
  div []
    [ button [ onClick address AddSpecies ] [ text "Add New Species" ]
    , div [] [ text (toString model) ]
    , button [ onClick address AddTransition ] [ text "Add New Transition" ]
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

