import React from 'react';
import autoBind from 'react-autobind';
import {Route, NavLink, HashRouter, BrowserRouter} from "react-router-dom";

import {AppBar, Button, Toolbar} from "material-ui";

import Home from './views/home';
import LogicTest from './views/logic-test';
import Torus from './views/torus';


import './app.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      width: 0,
      contentWidth: 0,
      contentHeight: 0
    };
    autoBind(this);
  }

  componentWillMount() {
    window.addEventListener('resize', this.resize);
  }

  componentDidMount() {
    this.resize();
  }

  resize() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    this.setState({
      width: w,
      height: h,
      contentWidth: w,
      contentHeight: h - this.appBar.clientHeight
    });
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <div ref={(appBar) => this.appBar = appBar}>
            <AppBar position={'static'} >
              <Toolbar>
                <NavLink to={'/home'}><Button color={'contrast'}>Home</Button></NavLink>
                <NavLink to={'/torus'}><Button color={'contrast'}>Torus</Button></NavLink>
                <NavLink to={'/logic_test'}><Button color={'contrast'}>Logic Test</Button></NavLink>
              </Toolbar>
            </AppBar>
          </div>

          <div>
            <Route path="/home"
                   render={(props) => (
                     <Home {...props} width={this.state.contentWidth} height={this.state.contentHeight} />
                   )}
            />
            <Route path="/torus"
                   render={(props) => (
                     <Torus {...props} width={this.state.contentWidth} height={this.state.contentHeight} />
                   )}
            />
            <Route path="/logic_test"
                   render={(props) => (
                     <LogicTest {...props} width={this.state.contentWidth} height={this.state.contentHeight} />
                   )}
            />
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;