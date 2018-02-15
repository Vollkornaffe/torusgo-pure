'use strict';

import React from 'react';

import {
  Drawer, Divider, Button, Toolbar, ExpansionPanel, ExpansionPanelSummary,
  ExpansionPanelDetails
} from 'material-ui';

import GameInfoTable from './GameInfoTable';

class GameInfoDrawer extends React.Component {

  makeid() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  randomBWF() {
    return ['Black', 'White', 'Finished'][Math.floor(Math.random()*3)];
  }

  randomBWO() {
    return ['Black', 'White', 'Observer'][Math.floor(Math.random()*3)];
  }

  randomTime() {
    let minutes = Math.floor(Math.random() * (60 - 0 + 1));
    let seconds = Math.floor(Math.random() * (60 - 0 + 1));
    return String.concat(minutes.toString, ':', seconds.toString());
  }

  generateTestGame() {
    return {
      players: {
        black: this.makeid(),
        white: this.makeid()
      },
      client_color: this.randomBWO(),
      times: {black: this.randomTime(), white: this.randomTime()},
      in_turn: this.randomBWF(),
      captures: {black: 123, white:123},
      score: {black: 0, white: 0}
    }
  }

  render() {
    let testGames = [];
    testGames.push(this.generateTestGame());
    testGames.push(this.generateTestGame());
    testGames.push(this.generateTestGame());
    testGames.push(this.generateTestGame());
    testGames.push(this.generateTestGame());

    return (
      <Drawer
        variant={'persistent'}
        anchor={'right'}
        open={this.props.open}>
          <Toolbar>
            <Button
              onClick={this.props.handleDrawerClose}>
              Close My Games
            </Button>
          </Toolbar>
        <Divider/>
        {
          testGames.map((testGame, i) => (
            <ExpansionPanel>
              <ExpansionPanelSummary>
                Game im Playing/Observing # {i.toString()}
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <GameInfoTable
                  players={{black: 'me', white: 'someGuy'}}
                  client_color={'Black'}
                  times={{black:'01:00', white:'00:01'}}
                  in_turn={'White'}
                  captures={{black: 1, white: 5}}
                  score={{black: 0, white: 0}}
                />
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))
        }
      </Drawer>
    );
  }
}

export default GameInfoDrawer;
