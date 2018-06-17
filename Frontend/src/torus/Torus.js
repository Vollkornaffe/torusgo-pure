import React from 'react';
import autoBind from 'react-autobind';
import update from 'immutability-helper';
import TorusCanvas from './Canvas';
import TorusControlPanel from './ControlPanel';

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
   * @return {JSX}
   */
  render() {
    const {handlePass, x, y, width, height, ...other} = this.props;
    const {delta} = this.state;
    return (
      <div>
        <TorusControlPanel
          setDelta={this.setDelta}
          handlePass={handlePass}
          keyTarget={document}
        />
        <TorusCanvas
          ref={(elem) => this.torus = elem}
          delta={delta}
          width={width} height={height}
          x={x} y={y}
          {...other}
        />
      </div>
    );
  }
}

export default TorusView;
