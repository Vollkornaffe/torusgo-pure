import React from 'react';
import autoBind from 'react-autobind';
import {Route, NavLink, HashRouter, BrowserRouter} from "react-router-dom";

import {AppBar, Button, Toolbar} from "material-ui";

import Home from './views/home';
import LogicTest from './views/logic-test';
import Torus from './views/torus';
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      width: 0
    };
    autoBind(this);
  }

  componentWillMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  resize() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <AppBar position={'static'}>
            <Toolbar>
              <NavLink to={'/home'}><Button color={'contrast'}>Home</Button></NavLink>
              <NavLink to={'/torus'}><Button color={'contrast'}>Torus</Button></NavLink>
              <NavLink to={'/logic_test'}><Button color={'contrast'}>Logic Test</Button></NavLink>
            </Toolbar>
          </AppBar>
          <div>
            <Route path="/home" component={Home}/>
            <Route path="/torus" component={Torus}/>
            <Route path="/logic_test" component={LogicTest}/>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;