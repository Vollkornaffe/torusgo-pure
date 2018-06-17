import React from 'react';
import {withStyles} from '@material-ui/core';

import SideBar from '../components/SideBarContainer';
import TorusContainer from '../torus/OnlineTorusContainer';

import '../app.css';
import Welcome from './WelcomeContainer';

const styles = (theme) => ({
  root: {},
});

/**
 */
class App extends React.Component {
  /**
   * @return {*}
   */
  render() {
    const {classes} = this.props;
    return (
      <div className={classes.root}>
        <SideBar/>
        <Welcome/>
      </div>
    );
  }
}

export default withStyles(styles)(App);
