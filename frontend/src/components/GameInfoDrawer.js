'use strict';

import React from 'react';

import {
  Drawer, Divider, Button, Toolbar, ExpansionPanel, ExpansionPanelSummary,
  ExpansionPanelDetails, IconButton
} from 'material-ui';

import GameInfoTable from './GameInfoTable';
import {ChevronRight} from "material-ui-icons";

class GameInfoDrawer extends React.Component {

  render() {
    let props = this.props;

    return (
      <Drawer
        variant={'persistent'}
        anchor={'right'}
        open={props.open}>
          <Toolbar>
            <IconButton onClick={props.handleDrawerClose}>
              <ChevronRight />
            </IconButton>
          </Toolbar>
        <Divider/>
        {
          props.games.map((testGame, i) => (
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
