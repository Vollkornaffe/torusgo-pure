import React from 'react';

import {
  Table, TableBody, TableRow, TableCell, TableHead,
  Button, IconButton
} from 'material-ui';
import Open from 'material-ui-icons/ArrowBack';

/**
 * @class GameInfoTable
 */
class GameInfoTable extends React.Component {
  /**
   * @return {XML}
   */
  render() {
    const {
      handleOpen,
      players,
      clientColor,
      times,
      inTurn,
      captures,
      score,
    } = this.props;

    const blackHeader = 'Black (' + players.black + ')';
    const whiteHeader = 'White (' + players.white + ')';

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

    let turnInfo;
    let bothCollumns;
    if (clientColor === 'Observer') {
      if (inTurn === 'Finished') {
        turnInfo = 'Game Ended.';
      } else {
        turnInfo = inTurn + '\'s Turn.';
      }
      bothCollumns = [blackCollumn, whiteCollumn];
    } else {
      if (inTurn === 'Finished') {
        turnInfo = 'Game Ended.';
      } else {
        if (clientColor === inTurn) {
          turnInfo = 'Your Turn!';
        } else {
          turnInfo = 'Waiting.';
        }
      }
      if (clientColor === 'Black') {
        bothCollumns = [blackCollumn, whiteCollumn];
      } else {
        bothCollumns = [whiteCollumn, blackCollumn];
      }
    }

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <IconButton
                title={'View this Game'}
                color={'primary'}
                onClick={handleOpen}>
                <Open />
              </IconButton>
            </TableCell>
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
