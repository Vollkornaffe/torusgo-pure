'use strict';
import React from 'react';
import autoBind from 'react-autobind';
import {Route, NavLink, BrowserRouter} from "react-router-dom";

import {AppBar, Button, IconButton, Toolbar, Typography} from "material-ui";

import {Menu} from 'material-ui-icons';
import Home from './views/home';
import LogicTest from './views/logic-test';
import Torus from './views/torus';

import GameInfoDrawer from './components/GameInfoDrawer';

import './app.css';

function makeid() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function randomBWF() {
  return ['Black', 'White', 'Finished'][Math.floor(Math.random()*3)];
}

function randomBWO() {
  return ['Black', 'White', 'Observer'][Math.floor(Math.random()*3)];
}

function randomTime() {
  let minutes = Math.floor(Math.random() * (60 - 0 + 1));
  let seconds = Math.floor(Math.random() * (60 - 0 + 1));
  return String.concat(minutes.toString, ':', seconds.toString());
}

function generateTestGame() {
  return {
    players: {
      black: {
        id: makeid(),
        name: 'random'
      },
      white: {
        id: makeid(),
        name: 'random'
      },
    },
    observers: {

    },
    times: {
      black: randomTime(),
      white: randomTime()
    },
    inTurn: randomBWF(),
    captures: {
      black: 123,
      white:123
    },
    score: {
      black: 0,
      white: 0
    }
  }
}


/**
 * data types
 *
 * USER
 *
 * the app instance always has one user object identifying the player, and access to the user objects of
 * other players (opponents)
 *
 * concept:
 * on first visit, user is asked for a name, server creates and saves guest user object, passes to app
 * on repeated visit, the last user object associated with the session is loaded
 *
 * user can make identity permanent by giving name and password (not relevant for the app atm)
 *
 * USER: {
 *  id: string, (primary key)
 *  name: string,
 *  guest: boolean
 * }
 *
 * GAME
 *
 * the app instance loads and maintains an array of active games the user is involved in
 *
 * Games are GameController instances
 *
 */



class App extends React.Component {

  constructor() {
    super();
    autoBind(this);

    let testGames = [];
    testGames.push(generateTestGame());
    testGames.push(generateTestGame());
    testGames.push(generateTestGame());
    testGames.push(generateTestGame());
    testGames.push(generateTestGame());

    this.state = {
      user: {
        id: makeid(),
        name: 'me'
      },
      activeGames: testGames,

      // UI stuff

      height: 0,
      width: 0,
      contentWidth: 0,
      contentHeight: 0,
      contentX: 0,
      contentY: 0,
      gameInfoDrawerOpen: true
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

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  componentDidMount() {
    this.setState({ready: true});
    this.resize();
  }

  handleDrawerOpen = () => {
    this.setState({gameInfoDrawerOpen: true});
  };

  handleDrawerClose = () => {
    this.setState({gameInfoDrawerOpen: false});
  };

  resize() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    this.setState({
      width: w,
      height: h,
      contentWidth: w,
      contentHeight: h - this.appBar.clientHeight,
      contentX: 0,
      contentY: this.appBar.clientHeight
    });
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <div ref={(appBar) => this.appBar = appBar}>
            <AppBar position={'static'} >
              <Toolbar>
                <Typography variant={'title'} color={'inherit'}>
                  TorusGo
                </Typography>
                <div className={'flex'}>
                  {
                    this.views.map((View, i) => (
                      <NavLink key={i} to={View.navPath}>
                        <Button color={'white'}>
                          {View.navLink}
                        </Button>
                      </NavLink>
                    ))
                  }
                </div>
                <IconButton onClick={this.handleDrawerOpen}>
                  <Menu/>
                </IconButton>
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
                    <View
                      {...props}
                      width={this.state.contentWidth}
                      height={this.state.contentHeight}
                      x={this.state.contentX}
                      y={this.state.contentY}
                    />
                  )}
                />
              ))
            }
          </div>
          <GameInfoDrawer
            open={this.state.gameInfoDrawerOpen}
            handleDrawerClose={this.handleDrawerClose}
            games={this.state.activeGames}
          />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;