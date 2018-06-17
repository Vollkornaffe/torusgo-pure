import React from 'react';

import OnlineTorus from '../torus/OnlineTorusContainer';

const Game = ({x, y, width, height}) => (
  <div style={{
    position: 'absolute',
    left: x,
    top: y,
    width: width,
    height: height,
  }}>
    <OnlineTorus offline/>
  </div>
);

export default Game;
