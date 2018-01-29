##TorusGo - Game Logic

This Module provides functions to create and manipulate TorusGo game states. The implementation is compiled from purescript.

####Installation

`npm install torusgo-logic --save`

####Usage
    const State = require('torusgo-logic').State;
    
    const state = new State(19,19);
    
    state.makeMove(0,0)
        .makeMove(1,1)
        .makeMove(0,1)
        .pass();
    
    console.log(state); //output:
    //‌State: { 
    //  size: 4x4, 
    //  moves: 4, 
    //  to move: b, 
    //  ko position: - 
    //  b prisoners: 0, 
    //  w prisoners: 0,
    //  board: b,-,-,-,b,w,-,-,-,-,-,-,-,-,-,-
    //}
   