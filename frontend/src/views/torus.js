import React from 'react';
import autoBind from 'react-autobind';

import Animation from '../components/Animation';

class Torus extends React.Component {

  constructor(props) {
    super(props);
    
    autoBind(this);
  }

  componentDidMount() {
    document.title = 'TorusGO | Animation';
    
    this.canvas = this.refs.canvas; //reference to DOM node
    let {width, height} = this.props;
    
    this.animation = new Animation({
      width: width,
      height: height,
      canvas: this.canvas
    });
    this.animation.start();
  }
  
  componentDidUpdate(prevProps, prevState) {
    //TODO check if w/h actually changed
    this.animation.setSize(this.props.width, this.props.height);
  }

  render() {
    const DEFAULT_DELTA = 0.05; //rotation delta per frame
    
    return (
      <div>
        <div style={{position: 'fixed', height: 30}}>
          {
            ['x', 'y', 'z', 'twist'].map((axis) => (
              <span key={axis}>
                <button onMouseDown={()=>{
                  this.animation.delta[axis] = DEFAULT_DELTA;
                }} onMouseUp={()=>{
                  this.animation.delta[axis] = 0;
                }}>
                  +{axis}
                </button>
                <button onMouseDown={()=>{
                  this.animation.delta[axis] = -DEFAULT_DELTA;
                }} onMouseUp={()=>{
                  this.animation.delta[axis] = 0;
                }}>
                  -{axis}
                </button>
                &ensp;
              </span>
            ))
          }
          <button onClick={() => {this.animation.reset()}}>Reset</button>
        </div>
        <canvas ref={'canvas'} width={this.props.width} height={this.props.height}/>
      </div>
    );
  }
}

export default Torus;