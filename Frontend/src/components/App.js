import React from 'react';
import {withStyles} from '@material-ui/core';

import MyAppBar from './AppBarContainer';
import SideBar from './SideBarContainer';
import TorusContainer from '../torus/TorusContainer';

import '../app.css';
import Welcome from './WelcomeContainer';

const styles = (theme) => ({
  root: {},
});

const App = ({classes}) => {
  return (
    <div className={classes.root}>
      <MyAppBar/>
      <Welcome/>
    </div>
  );
};

export default withStyles(styles)(App);
