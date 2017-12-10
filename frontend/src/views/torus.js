import React from 'react';

import ogs from '../index.svg';
import TorusContainer from '../containers/TorusContainer';

class Torus extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentDidMount() {
    document.title = 'TorusGO | Torus'
  }

  render() {
    return (
      <TorusContainer />
    );
  }
}

export default Torus;