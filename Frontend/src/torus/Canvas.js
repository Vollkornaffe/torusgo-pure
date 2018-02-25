
import React from 'react';

import autoBind from 'react-autobind';

import Animation from './Animation';

/**
 * @class TorusCanvas
 */
class TorusCanvas extends React.Component {
  /**
   */
  componentDidMount() {
    let {width, height} = this.props;

    this.animation = new Animation({
      width: width,
      height: height,
      canvas: this.canvas,

      // board properties
      boardSize: this.props.boardSize,
      boardState: this.props.boardState,
    });

    this.animation.start();
  }

  /**
   */
  componentWillUnmount() {
    this.animation.stop();
    this.canvas = null;
    this.animation = null;
  }

  /**
   * @param {object} prevProps
   * @param {object} prevState
   * @param {object} prevContext
   */
  componentDidUpdate(prevProps, prevState, prevContext) {
    if (prevProps.width !== this.props.width
      || prevProps.height !== this.props.height) {
      this.animation.setSize(this.props.width, this.props.height);
    }

    if (prevProps.delta !== this.props.delta) {
      this.animation.setDelta(this.props.delta);
    }

    if (prevProps.cursor !== this.props.cursor) {
      this.animation.setCursor(this.props.cursor);
    }

    if (prevProps.boardState !== this.props.boardState) {
      this.animation.setBoardState(this.props.boardState);
    }

    if (prevProps.scoring !== this.props.scoring) {
      this.animation.setScoringMarks(this.props.scoring);
    }
  }

  /**
   * @return {XML}
   */
  render() {
    const {width, height} = this.props;
    return (
      <canvas
        ref={(canvas) => this.canvas = canvas}
        width={width}
        height={height}
      />
    );
  }
}

export default TorusCanvas;
