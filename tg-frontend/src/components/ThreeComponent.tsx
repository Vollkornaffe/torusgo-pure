import * as React from 'react';
import autoBind from 'react-autobind';

export interface IProps {
  width: number,
  height: number,
  boardSizeX: number,
  boardSizeY: number,
}

class ThreeComponent extends React.Component<IProps> {

  private canvas: HTMLCanvasElement;

  constructor(props: IProps) {
    super(props);
    autoBind(this);
  }

  public componentDidMount() {
    const {width, height, boardSizeX, boardSizeY,} = this.props;

    /*
    this.animation = new Animation({
      width,
      height,
      canvas: this.canvas,

      // board properties
      boardSize,
      boardState,
    });
    */

    // this.animation.start();

    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('click', this.onMouseClick);
  }

  public onMouseClick() {
    alert("you clicked the canvas");
    // const field = this.animation.getSelectedField();
    // if (field) {
    //   this.props.handleInteraction(this.props.gameId, field);
    // }
  }

  public onMouseMove(event: MouseEvent) {
    // this.animation.setCursor({
    //   x: event.clientX - this.props.x,
    //   y: event.clientY - this.props.y,
    // });
  }

  public componentWillUnmount() {
    this.canvas.removeEventListener('click', this.onMouseClick);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);

    // this.animation.stop();
  }

  // componentDidUpdate(prevProps, prevState, prevContext) {
  //   if (prevProps.width !== this.props.width
  //     || prevProps.height !== this.props.height) {
  //     //this.animation.setSize(this.props.width, this.props.height);
  //   }

  //   if (prevProps.delta !== this.props.delta) {
  //     this.animation.setDelta(this.props.delta);
  //   }

  //   if (prevProps.boardState !== this.props.boardState) {
  //     this.animation.setBoardState(this.props.boardState);
  //   }

  //   if (prevProps.scoring !== this.props.scoring) {
  //     this.animation.setScoringMarks(this.props.scoring);
  //   }
  // }


  
  public render() {
    const {width, height} = this.props;
    return (
      <canvas
        ref={(canvas) => this.canvas = canvas!}
        width={width}
        height={height}
      />
    );
  }
}

export default ThreeComponent;
