import React from 'react';
import autoBind from 'react-autobind';

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
      mouse: {
        x: 0,
        y: 0,
      },
      cursor: null,
    };
  }

  /**
   */
  componentDidMount() {
    this.torus.canvas.addEventListener('mousemove', this.onMouseMove);
    this.torus.canvas.addEventListener('click', this.onMouseClick);
  }

  /**
   */
  componentWillUnmount() {
    this.torus.canvas.removeEventListener('mousemove', this.onMouseMove);
  }

  /**
   * @param {Event} event mouse-move-event
   */
  onMouseMove(event) {
    this.setState({
      cursor: {
        x: event.clientX - this.props.x,
        y: event.clientY - this.props.y,
      },
    });
  }

  /**
   */
  onMouseClick() {
    const field = this.torus.animation.getSelectedField();
    if (field) {
      this.props.handleInteraction(field);
    }
  }

  /**
   * @param {object} object
   */
  setDelta(object) {
    let newDelta = {...this.state.delta};
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        if (newDelta.hasOwnProperty(key)) {
          newDelta[key] = object[key];
        }
      }
    }
    this.setState({delta: newDelta});
  }

  /**
   * @return {XML}
   */
  render() {
    const {handlePass, ...other} = this.props;
    const {delta, cursor} = this.state;

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
          cursor={cursor}
          {...other}
        />
      </div>
    );
  }
}

export default TorusView;
