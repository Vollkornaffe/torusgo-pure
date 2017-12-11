import React from 'react';

import ogs from '../index.svg';
import AnimationContainer from '../containers/AnimationContainer';

class Torus extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentDidMount() {
    document.title = 'TorusGO | Animation'
  }

  render() {
    return (
      <AnimationContainer />
    );
  }
}

export default Torus;