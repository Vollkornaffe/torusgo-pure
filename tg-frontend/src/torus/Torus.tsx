import * as React from 'react';
import autoBind from 'react-autobind';
// import TorusCanvas from './Canvas';
// import TorusControlPanel from './ControlPanel';
import {IViewProps} from '../types';

export type TTorusProps = IViewProps;

export interface ITorusState {
  delta: {
    x: number,
    y: number,
    z: number,
    twist: number,
    zoom: number,
    scoringMode: boolean,
  },
}

export default class Torus extends React.Component<TTorusProps, ITorusState> {
  constructor(props : TTorusProps) {
    super(props);
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
   * @return {JSX}
   */
  public render() {
    const {x, y, width, height, ...other} = this.props;
    const {delta} = this.state;
    return (
      <div>
        {
          /*

        <TorusControlPanel
          setDelta={this.setDelta}
          handlePass={()=>{}}
          keyTarget={document}
        />
        <TorusCanvas
          ref={(elem: HTMLElement) => this.refs.torus = elem}
          delta={delta}
          width={width} height={height}
          x={x} y={y}
          {...other}
        />
           */
        }
      </div>
    );
  }

  protected setDelta(newDelta: ITorusState['delta']) {
    this.setState({
      delta: Object.assign({}, this.state.delta, newDelta),
      ...this.state,
    });
  }
}