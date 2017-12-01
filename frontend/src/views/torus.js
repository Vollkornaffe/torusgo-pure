import React from 'react';

import ogs from '../index.svg';

class Torus extends React.Component {

  componentDidMount() {
    document.title = 'TorusGO | Torus'
  }

  render() {
    return (
      <div style={{backgroundColor: '#ffb98e'}}>
          <img src={ogs} alt={'logo'} width={this.props.width} height={this.props.height}/>
      </div>
    );
  }
}

export default Torus;