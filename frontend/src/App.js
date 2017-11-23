import React from 'react';
import GameLogic from 'torusgo-logic';

import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';

function env () {
  const {State, White, Black, Nothing} = GameLogic;

  let state0, state1, state2, state3, state = null;

  function myEval(expr) {
    try{
      eval(expr);
      return myPrint();
    } catch (err) {
      return '';
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

function stringify (object) {
  if(typeof object === 'string') {
    return object;
  } else {
    try{
      return JSON.stringify(object);
    } catch (err) {
      return 'Invalid: ' + err.message;
    }
  }
}


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      width: 0,
      value: 'state = new State(',
      gameStates: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.eval = env();
  }



  componentWillMount() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
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

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Grid item xs={12}>
          Available vars: <code>state, state0, state1, state2, state3</code>.
          Available Classes: <code>State, Black, White, Nothing</code>.
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

export default App;