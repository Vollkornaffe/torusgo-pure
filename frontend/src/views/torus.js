'use strict';

import React from 'react';
import autoBind from 'react-autobind';

import Torus from '../components/torus';
import TorusControls from '../components/torus-controls';

class TorusView extends React.Component {
  static navPath = '/torus';
  static navLink = 'Torus';
  
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      delta: {
        x:0,
        y:0,
        z:0,
        twist:0,
        zoom:0
      },
      mouse:{
        x: 0,
        y: 0
      }
    };

  }

  componentDidMount() {
    document.title = 'TorusGO | Animation';

    //seems wrong to do this here, maybe on a different level...
    this.torus.canvas.addEventListener('mousemove', this.onMouseMove)
  }

  onMouseMove(event) {
    this.setState({
      cursor: {
        x: event.clientX - this.props.x,
        y: event.clientY - this.props.y
      }
    });
  }
  
  setDelta(object) {
    let newDelta = {...this.state.delta};
    for(let key in object) {
      if(object.hasOwnProperty(key)) {
        if(newDelta.hasOwnProperty(key)) {
          newDelta[key] = object[key];
        }
      }
    }
    this.setState({delta: newDelta});
  }
  
  render() {
    return (
      <div>
        <TorusControls
          ref={(elem) => {this.torusControls = elem}}
          setDelta={this.setDelta}
          keyTarget={document}
        />
        <Torus
          ref={(elem) => {this.torus = elem}}
          width={this.props.width}
          height={this.props.height}
          delta={this.state.delta}
          cursor={this.state.cursor}
        />
      </div>
    );
  }
}

export default TorusView;