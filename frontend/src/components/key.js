import autoBind from 'react-autobind';

class KeyContext {
  /**
   * Context for Key Events, consisting of a keyCode and DOM element.
   * A DOM element will only receive key events if it is in focus.
   * DIVs can be made focusable by adding a tabindex value
   * @param code A key code as number, or a key identifier as string
   * @param target A focusable DOM node
   */
  constructor(code, target) {
    autoBind(this);
    
    if(typeof code === 'number') {
      this.check = (event) => (event.code === code);
    } else if(typeof code === 'string') {
      this.check = (event) => (event.key === code);
    }
    
    this.target = target;
    this.handlers = [];
  }
  
  addEventListener(type, fn) {
    if(typeof fn === 'function') {
      let check = this.check;
      let wrapper = function (event) {
        if(check(event)) {
          fn(event);
        }
      };
      
      this.target.addEventListener(type, wrapper);
      this.handlers.push(wrapper);
    }
  }
  
  removeAllListeners(type) {
    this.handlers.forEach((handler) => {
      this.target.removeEventListener(type, handler);
    });
  }
}

export default KeyContext;