import React from 'react';
import KeyContext from './key';

const DELTA = 0.05;

class TorusControlPanel extends React.Component {
  
  render() {
    const {keyTarget, setDelta} = this.props;
    
    return (
      <div style={{position: 'absolute'}}>
        <TorusAction
          start={()=> setDelta({z: -DELTA}) }
          stop={()=> setDelta({z: 0}) }
          keyContext={new KeyContext('q', keyTarget)}
        >
          z- <b>(q)</b>
        </TorusAction>
        <TorusAction
          start={()=> setDelta({x: DELTA}) }
          stop={()=> setDelta({x: 0}) }
          keyContext={new KeyContext('w', keyTarget)}
        >
          x+ <b>(w)</b>
        </TorusAction>
        <TorusAction
          start={()=> setDelta({z: DELTA}) }
          stop={()=> setDelta({z: 0}) }
          keyContext={new KeyContext('e', keyTarget)}
        >
          z+ <b>(e)</b>
        </TorusAction>
        <br />
        <TorusAction
          start={()=> setDelta({y: -DELTA}) }
          stop={()=> setDelta({y: 0}) }
          keyContext={new KeyContext('a', keyTarget)}
        >
          y- <b>(a)</b>
        </TorusAction>
        <TorusAction
          start={()=> setDelta({x: -DELTA}) }
          stop={()=> setDelta({x: 0}) }
          keyContext={new KeyContext('s', keyTarget)}
        >
          x- <b>(s)</b>
        </TorusAction>
        <TorusAction
          start={()=> setDelta({y: DELTA}) }
          stop={()=> setDelta({y: 0}) }
          keyContext={new KeyContext('d', keyTarget)}
        >
          y+ <b>(d)</b>
        </TorusAction>
        <br />
        <TorusAction
          start={()=> setDelta({twist: DELTA}) }
          stop={()=> setDelta({twist: 0}) }
          keyContext={new KeyContext('z', keyTarget)}
        >
          twist+ <b>(z)</b>
        </TorusAction>
        <TorusAction
          start={()=> setDelta({twist: -DELTA}) }
          stop={()=> setDelta({twist: 0}) }
          keyContext={new KeyContext('x', keyTarget)}
        >
          twist- <b>(x)</b>
        </TorusAction>
      </div>
    );
  }
}

class TorusAction extends React.Component {
  
  componentDidMount() {
    const {keyContext, start, stop, once} = this.props;
  
    if(keyContext) {
      if(start) {
        keyContext.addEventListener('keydown', start);
      }
      if(stop) {
        keyContext.addEventListener('keyup', stop);
      }
      if(once) {
        keyContext.addEventListener('keypress', once);
      }
    }
  }
  
  componentWillUnmount() {
    this.props.keyContext.removeAllListeners();
  }
  
  render() {
    const {children, start, stop, once} = this.props;
    
    return (
      <button
        className={'torus-button'}
        onMouseDown={start}
        onMouseUp={stop}
        onMouseOut={stop}
        onClick={once}
      >
        {children}
      </button>
    );
  }
}

export default TorusControlPanel;