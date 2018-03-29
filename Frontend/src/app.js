import React from 'react';
import autoBind from 'react-autobind';
import {BrowserRouter} from 'react-router-dom';
import update from 'immutability-helper';
import {Reboot, withStyles} from 'material-ui';
import Torus from './torus/View';
import MyAppBar from './components/AppBar';
import SideBar from './components/SideBar';
import Game from './logic/Game';
import User from './logic/User';
import Test from './logic/test';
import openSocket from 'socket.io-client';

import './app.css';

const styles = (theme) => ({
  root: {

  },
  content: {

    backgroundColor: 'blue',
  },
});

/**
 * @class App
 */
class App extends React.Component {
  /**
   * @constructor
   */
  constructor() {
    super();
    autoBind(this);

    let users = [
      new User({name: 'Lars'}),
      new User({name: 'Lukas'}),
      new User({name: 'Sarah'}),
      new User({name: 'Daniel'}),
    ];

    let socket = openSocket('https://torusgo.com:63730');

    // handle server -> client
    socket.on('test message', (msg) => {
      alert(msg);
    });
    socket.on('token provision', (tokenPacket) => {
      alert("got token");
      window.localStorage["user id token"] = tokenPacket.token;
    });

    // handle client -> server
    let backendAPI = {
      requestLoginToken: (username, password) => {
        alert("requesting user id token...");
        socket.emit('token request', {
          tokentype: 'userid',
          credentials: {
            username: username,
            password: password
          }
        });
      },
    };

    let games = [
      new Game({
        black: {
          id: users[0].id,
        },
        white: {
          id: users[1].id,
        },
      }),
      new Game({
        black: {
          id: users[3].id,
        },
        white: {
          id: users[2].id,
        },
      }),
      new Game({
        black: {
          id: users[1].id,
        },
        white: {
          id: users[3].id,
        },
      }),
      new Game({
        black: {
          id: users[0].id,
        },
        white: {
          id: users[2].id,
        },
      }),
      new Game({
        black: {
          id: users[1].id,
        },
        white: {
          id: users[1].id,
        },
      }),
    ];

    this.state = {
      contentWidth: 0,
      contentHeight: 0,
      contentX: 0,
      contentY: 0,
      users: users,
      games: games,
      thisUserId: users[1].id,
      activeGame: games[0],
      activeView: 'torus',

      socket: socket,
      backendAPI: backendAPI,
    };
  }

  /**
   */
  componentDidMount() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    if (prevState.activeGame !== this.state.activeGame) {
      console.log(this.state.activeGame.getState().jsonState);
    }
  }

  /**
   */
  onResize() {
    let ww = window.innerWidth;
    let wh = window.innerHeight;

    let sw = this.sideBar.clientWidth;
    let ah = this.appBar.clientHeight;

    this.setState({
      contentWidth: ww - sw,
      contentHeight: wh - ah,
      contentY: ah,
    });
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  onInteraction({x, y}) {
    const {activeGame, games} = this.state;
    if (activeGame) {
      const index = games.indexOf(activeGame);
      let valid = activeGame.suggest(x, y);
      let newGame = activeGame.interact(x, y);
      if (valid) {
        this.setState({
          games: update(games, {$splice: [[index, 1, newGame]]}),
          activeGame: newGame,
        });
      } else {
        console.log('invalid ' + x + ' ' + y);
      }
    }
  }

  /**
   */
  onPass() {
    const {activeGame, games} = this.state;
    if (activeGame) {
      const index = games.indexOf(activeGame);
      const newGame = activeGame.pass();
      if (newGame !== activeGame) {
        this.setState({
          games: update(games, {$splice: [[index, 1, newGame]]}),
          activeGame: newGame,
        });
      }
    }
  }

  /**
   * @param {number} index
   */
  onSwitch(index) {
    const {activeGame, games} = this.state;
    let currentIndex = games.indexOf(activeGame);

    if (currentIndex !== index) {
      this.setState({activeGame: games[index]});
    }
  }

  /**
   * @return {XML}
   */
  render() {
    let {classes} = this.props;
    let {
      contentWidth, contentHeight, contentX, contentY, games, users,
      activeView, thisUserId, activeGame, backendAPI
    } = this.state;

    let content = null;

    switch (activeView) {
      case 'torus':
        content = (
          <Torus
            handleInteraction={this.onInteraction}
            handlePass={this.onPass}
            boardSize={{x: activeGame.x, y: activeGame.y}}
            boardState={activeGame.getState().getFieldArray()}
            scoring={activeGame.getState().getScoringMarks()}
            x={contentX}
            y={contentY}
            width={contentWidth}
            height={contentHeight}/>
        );
        break;
      default: break;
    }

    return (
      <BrowserRouter>
        <div className={classes.root}>
          <Reboot />
          <MyAppBar
            rootRef={(elem) => this.appBar = elem}
            loginFunction={backendAPI.requestLoginToken}
          />
          <SideBar
            rootRef={(elem) => this.sideBar = elem}
            handleSwitch={this.onSwitch}
            thisUserId={thisUserId}
            games={games}
            users={users}/>
          <div style={{
            position: 'fixed',
            top: contentY,
            left: contentX,
          }}>
            {content}
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default withStyles(styles)(App);
