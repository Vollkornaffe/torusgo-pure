'use strict';
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
  
    autoBind(this);
    
    this.state = {
      height: 0,
      width: 0,
      contentWidth: 0,
      contentHeight: 0
    };
    
    
    this.views = [
      Home,
      Torus,
      LogicTest
    ];
    
  }

  componentWillMount() {
    window.addEventListener('resize', this.resize);
  }

  componentDidMount() {
    this.setState({ready: true});
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
                {
                  this.views.map((View, i) => (
                    <NavLink key={i} to={View.navPath}>
                      <Button color={'contrast'}>
                        {View.navLink}
                      </Button>
                    </NavLink>
                  ))
                }
              </Toolbar>
            </AppBar>
          </div>
          <div>
            {
              this.views.map((View, i) => (
                <Route
                  key={i}
                  path={View.navPath}
                  render={(props) => (
                    <View {...props} width={this.state.contentWidth} height={this.state.contentHeight} />
                  )}
                />
              ))
            }
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;