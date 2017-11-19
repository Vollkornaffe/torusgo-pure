import React from 'react';
import GameLogic from './output';

import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';


let context = {
  GameLogic: GameLogic,
  state: null
};

function evaluate( expr ) {
  try{
    return function() {
      let ret =  eval(expr);
      if(!ret) {
         return this.state;
      }
      return ret;
    }.call(context);
  } catch (err) {
    return 'Error: ' + expr;
  }
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
      value: '',
      gameStates: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    window.GL = GameLogic;
  }



  componentWillMount() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    let state = evaluate(this.state.value);
    context.state = state;
    this.setState({
      gameStates: [...this.state.gameStates, state],
      value: ''
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
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
                <code>{stringify(gameState)}</code>
              </Grid>
            );
          })}
        </Grid>
      </div>
    );
  }
}

export default App;