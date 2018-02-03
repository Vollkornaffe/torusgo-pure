import React from 'react';
import autoBind from 'react-autobind';
import State from '../logic/game-logic';

import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';


function env () {
  let state0, state1, state2, state3, state = null;

  function myEval(expr) {
    try{
      function newState(w, h) {
        return new State(w, h);
      }
      eval(expr);
      return myPrint();
    } catch (err) {
      return console.log(err);
    }
  }

  function myPrint() {
    let ret = '';
    [state0, state1, state2, state3, state].forEach((s, index) => {
      if(s instanceof State) {
        let name = 'state' + index;
        if(index === 4) {
          name = 'state';
        }
        ret += name + ': ' + s.toString();
      }
    });
    return ret;
  }

  return myEval;
}

class LogicTest extends React.Component {
  static navPath = '/logic_test';
  static navLink = 'Game Logic';
  
  constructor(props) {
    super(props);
    this.state = {
      value: 'state = newState(9,9)',
      gameStates: []
    };
    this.eval = env();

    autoBind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    let output = this.eval(this.state.value);
    if(output !== '' && output !== this.state.gameStates[this.state.gameStates.length-1]) {
      this.setState({
        gameStates: [...this.state.gameStates, output],
        value: ''
      });
    } else {
      this.setState({
        value: ''
      });
    }

  }

  componentDidMount() {
    document.title = 'TorusGO | LogicTest'
  }

  render() {
    return (
      <div>
        <Grid item xs={12}>
          <hr />
          Available vars: <code>state, state0, state1, state2, state3</code>.
          Available Classes: <code>State, Black, White, Nothing</code>.<br />
          A new line is printed only if one of the states changed.
          <hr />
        </Grid>
        <Grid container direction="column">
          <Grid item xs={12}>
            <form noValidate autoComplete="off" onSubmit={this.handleSubmit}>
              <Grid container>
                <Grid item xs={11}>
                  <TextField
                    id="eval"
                    fullWidth
                    onChange={this.handleChange}
                    value={this.state.value}
                    inputProps={
                      {
                        style: {
                          fontFamily: 'DejaVu Sans Mono',
                          backgroundColor: '#EEEEEE'
                        }
                      }
                    }
                  />
                </Grid>
                <Grid item xs={1}>
                  <input type={'submit'} value={'Evaluate'}/>
                </Grid>
              </Grid>
            </form>
          </Grid>
          {this.state.gameStates.map((gameState, index) => {
            return (
              <Grid item key={index.toString()}>
                <code>{gameState}</code>
              </Grid>
            );
          })}
        </Grid>
      </div>
    );
  }
}

export default LogicTest;