import React from 'react';
import {withStyles} from 'material-ui';

import MyAppBar from './AppBarContainer';
import SideBar from './SideBarContainer';
import TorusContainer from '../torus/TorusContainer';

import '../app.css';

const styles = (theme) => ({
  root: {},
});

const App = ({classes}) => {
  return (
    <div className={classes.root}>
      <MyAppBar/>
      <SideBar/>
      <TorusContainer/>
    </div>
  );
};

export default withStyles(styles)(App);
