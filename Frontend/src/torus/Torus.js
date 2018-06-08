import React from 'react';
import autoBind from 'react-autobind';
import update from 'immutability-helper';
import TorusCanvas from './Canvas';
import TorusControlPanel from './ControlPanel';
import {Button, Grid, Typography} from '@material-ui/core';

const NoGame = (props) => (
  <Grid
    container
    style={{
      poisition: 'relative',
      width: '100%',
      height: '100%',
    }}
    justify={'center'}
    alignItems={'center'}
    direction={'column'}>
    <Grid item>
      <Typography>
        You can select a game one the right
      </Typography>
    </Grid>
    <Grid item>
      <Typography>
        <b>-or-</b>
      </Typography>
    </Grid>
    <Grid item>
      <Button
        onClick={props.handleNewGame}
        color={'primary'}
        variant={'raised'}>
        Start a new Game
      </Button>
    </Grid>
  </Grid>
);

/**
 * @class TorusView
 */
class TorusView extends React.Component {
  /**
   * @constructor
   */
  constructor() {
    super();
    autoBind(this);

    this.state = {
      delta: {
        x: 0,
        y: 0,
        z: 0,
        twist: 0,
        zoom: 0,
        scoringMode: false,
      },
    };
  }

  /**
   * @param {object} newDelta
   */
  setDelta(newDelta) {
    this.setState(update(this.state, {
      delta: {
        $merge: newDelta,
      },
    }));
  }

  /**
   * @return {XML}
   */
  render() {
    const {
      handlePass, handleNewGame, gameId, x, y, width, height, ...other,
    } = this.props;
    const {delta} = this.state;

    const style = {
      position: 'absolute',
      left: x,
      top: y,
      width: width,
      height: height,
    };

    if (!gameId) {
      return (
        <div style={style}>
          <NoGame handleNewGame={handleNewGame}/>
        </div>
      );
    }

    return (
      <div style={style}>
        <TorusControlPanel
          setDelta={this.setDelta}
          handlePass={handlePass}
          gameId={gameId}
          keyTarget={document}
        />
        <TorusCanvas
          ref={(elem) => this.torus = elem}
          delta={delta}
          width={width}
          height={height}
          x={x}
          y={y}
          gameId={gameId}
          {...other}
        />
      </div>
    );
  }
}

export default TorusView;
