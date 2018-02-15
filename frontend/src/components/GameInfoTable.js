'use strict';

import React from 'react';

import {Table, TableBody, TableRow, TableCell, TableHead} from 'material-ui';

class GameInfoTable extends React.Component {

  render() {
    const {
      players,
      client_color,
      times,
      in_turn,
      captures,
      score,
    } = this.props;

    const blackHeader = String.concat('Black (', players.black, ')');
    const whiteHeader = String.concat('White (', players.white, ')');

    const blackCollumn = [
      (<TableCell>{blackHeader}</TableCell>),
      (<TableCell numeric>{times.black}</TableCell>),
      (<TableCell numeric>{captures.black}</TableCell>),
      (<TableCell numeric>{score.black}</TableCell>),
    ];
    const whiteCollumn = [
      (<TableCell>{whiteHeader}</TableCell>),
      (<TableCell numeric>{times.white}</TableCell>),
      (<TableCell numeric>{captures.white}</TableCell>),
      (<TableCell numeric>{score.white}</TableCell>),
    ];

    let turn_info;
    let bothCollumns;
    if (client_color === 'Observer') {
      if (in_turn === 'Finished') {
        turn_info = 'Game Ended.'
      } else {
        turn_info = String.concat(in_turn, "'s Turn.");
      }
      bothCollumns = [blackCollumn, whiteCollumn];
    } else {
      if (in_turn === 'Finished') {
        turn_info = 'Game Ended.'
      } else {
        if (client_color === in_turn) {
          turn_info = 'Your Turn!';
        } else {
          turn_info = 'Waiting.'
        }
      }
      if (client_color === 'Black') {
        bothCollumns = [blackCollumn, whiteCollumn];
      } else {
        bothCollumns = [whiteCollumn, blackCollumn];
      }
    }

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{turn_info}</TableCell>
            {bothCollumns[0][0]}
            {bothCollumns[1][0]}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Time</TableCell>
            {bothCollumns[0][1]}
            {bothCollumns[1][1]}
          </TableRow>
          <TableRow>
            <TableCell>Captures</TableCell>
            {bothCollumns[0][2]}
            {bothCollumns[1][2]}
          </TableRow>
          <TableRow>
            <TableCell>Score</TableCell>
            {bothCollumns[0][3]}
            {bothCollumns[1][3]}
          </TableRow>
        </TableBody>
      </Table>
    );
  }
}

export default GameInfoTable;
