import {MuiThemeProvider} from '@material-ui/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import App from './App';
import {keyPressUpdate} from './redux/actions';
import store from './redux/store';
import registerServiceWorker from './registerServiceWorker';
import theme from './theme';

document.addEventListener('keydown', (event: KeyboardEvent) => {
  keyPressUpdate(event.code, true);
});

document.addEventListener('keyup', (event: KeyboardEvent) => {
  keyPressUpdate(event.code, false);
});

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <App />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root') as HTMLElement,
);
registerServiceWorker();
