import {CssBaseline} from '@material-ui/core';
import * as React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import MyAppBar from './components/AppBarContainer';
import ConnectionStatus from './components/StatusContainer';
import View from './views/ViewContainer';

const StatusView = () => <View><ConnectionStatus/></View>;

export default () => (
  <div>
    <CssBaseline/>
    <Router>
      <div>
        <MyAppBar/>
        <Route path={'/'} component={StatusView}/>
      </div>
    </Router>
  </div>
);
