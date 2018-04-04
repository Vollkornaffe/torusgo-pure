import React from 'react';
import autoBind from 'react-autobind';

const DELTA = 1;

/**
 * @class KeyContext
 */
class KeyContext {
  /**
   * Context for Key Events, consisting of a keyCode and DOM element.
   * A DOM element will only receive key events if it is in focus.
   * DIVs can be made focusable by adding a tabindex value
   * @param {number | string} code A key code or a key identifier
   * @param {object} target A focusable DOM node
   */
  constructor(code, target) {
    autoBind(this);

    if (typeof code === 'number') {
      this.check = (event) => (event.code === code);
    } else if (typeof code === 'string') {
      this.check = (event) => (event.key === code);
    }

    this.target = target;
    this.handlers = [];
  }

  /**
   * @param {string} type
   * @param {function} fn
   */
  addEventListener(type, fn) {
    if (typeof fn === 'function') {
      let check = this.check;
      let wrapper = function(event) {
        if (check(event)) {
          fn(event);
        }
      };

      this.target.addEventListener(type, wrapper);
      this.handlers.push(wrapper);
    }
  }

  /**
   * @param {string} type
   */
  removeAllListeners(type) {
    this.handlers.forEach((handler) => {
      this.target.removeEventListener(type, handler);
    });
  }
}

/**
 * @class TorusControlPanel
 */
class TorusControlPanel extends React.Component {
  /**
   * @return {XML}
   */
  render() {
    const {keyTarget, setDelta, handlePass, gameId} = this.props;

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
          keyContext={new KeyContext('d', keyTarget)}
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
          keyContext={new KeyContext('s', keyTarget)}
        >
          y- <b>(a)</b>
        </TorusAction>
        <TorusAction
          start={()=> setDelta({x: -DELTA}) }
          stop={()=> setDelta({x: 0}) }
          keyContext={new KeyContext('a', keyTarget)}
        >
          x- <b>(s)</b>
        </TorusAction>
        <TorusAction
          start={()=> setDelta({y: DELTA}) }
          stop={()=> setDelta({y: 0}) }
          keyContext={new KeyContext('w', keyTarget)}
        >
          y+ <b>(d)</b>
        </TorusAction>
        <br />
        <TorusAction
          start={()=> setDelta({twist: DELTA*0.1}) }
          stop={()=> setDelta({twist: 0}) }
          keyContext={new KeyContext('z', keyTarget)}
        >
          twist+ <b>(z)</b>
        </TorusAction>
        <TorusAction
          start={()=> setDelta({twist: -DELTA*0.1}) }
          stop={()=> setDelta({twist: 0}) }
          keyContext={new KeyContext('x', keyTarget)}
        >
          twist- <b>(x)</b>
        </TorusAction>
        <br />
        <TorusAction
          once={() => handlePass(gameId)}
          keyContext={new KeyContext('p', keyTarget)}
        >
          Pass <b>(p)</b>
        </TorusAction>
      </div>
    );
  }
}

/**
 * @class TorusAction
 */
class TorusAction extends React.Component {
  /**
   */
  componentDidMount() {
    const {keyContext, start, stop, once} = this.props;

    if (keyContext) {
      if (start) {
        keyContext.addEventListener('keydown', start);
      }
      if (stop) {
        keyContext.addEventListener('keyup', stop);
      }
      if (once) {
        keyContext.addEventListener('keypress', once);
      }
    }
  }

  /**
   */
  componentWillUnmount() {
    this.props.keyContext.removeAllListeners();
  }

  /**
   * @return {XML}
   */
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
