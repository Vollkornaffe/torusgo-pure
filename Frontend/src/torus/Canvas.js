import React from 'react';
import autoBind from 'react-autobind';
import Animation from './Animation';

/**
 * @class TorusCanvas
 */
class TorusCanvas extends React.Component {
  /**
   * @constructor
   */
  constructor() {
    super();
    autoBind(this);
  }

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

    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('click', this.onMouseClick);
  }

  /**
   * click event callback function
   */
  onMouseClick() {
    const field = this.animation.getSelectedField();
    if (field) {
      this.props.handleInteraction(this.props.gameId, field);
    }
  }

  /**
   * mousemove event callback function
   * @param {event} event
   */
  onMouseMove(event) {
    this.animation.setCursor({
      x: event.clientX - this.props.x,
      y: event.clientY - this.props.y,
    });
  }

  /**
   */
  componentWillUnmount() {
    this.canvas.removeEventListener('click', this.onMouseClick);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);

    this.animation.stop();
  }

  /**
   * 'listen' for prop/state changes and call the respective animation functions
   *
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

    if (prevProps.boardState !== this.props.boardState) {
      this.animation.setBoardState(this.props.boardState);
    }

    if (prevProps.scoring !== this.props.scoring) {
      this.animation.setScoringMarks(this.props.scoring);
    }
  }

  /**
   * @return {*}
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
