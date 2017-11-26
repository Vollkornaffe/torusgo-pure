import React from 'react';

class Home extends React.Component {
  componentDidMount() {
    document.title = 'TorusGO | Home'
  }

  render() {
    return (
      <div>
        <p>
          Home
        </p>
      </div>
    );
  }
}

export default Home;