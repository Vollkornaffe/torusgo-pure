import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {CssBaseline} from '@material-ui/core';
import logger from 'redux-logger';

import connect from './utils/connectView';
import MyAppBar from './components/AppBarContainer';

import uiReducer from './redux/ui-reducer';
import gameReducer from './redux/game-reducer';
import userReducer from './redux/user-reducer';

import {windowResize, addUser} from './redux/actions';
import registerServiceWorker from './registerServiceWorker';
import Welcome from './views/Welcome';

const appReducer = combineReducers({
  games: gameReducer,
  ui: uiReducer,
});

const store = createStore(appReducer, applyMiddleware(logger));

// let clientId = window.localStorage.getItem('jsonWebToken');

// store.dispatch(addUser('default', 'Lukas'));

const handleResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  store.dispatch(windowResize(width, height));
};


window.addEventListener('resize', handleResize);
handleResize();

const Root = () => (
  <div>
    <CssBaseline/>
    <Provider store={store}>
        <Router>
          <div>
            <MyAppBar/>
            <Route path={'/register'} />
            <Route path={'/local'} />
            <Route path={'/local/:game'} />
            <Route path={'/'} />
          </div>
        </Router>
    </Provider>
  </div>
);

ReactDOM.render(<Root/>, document.getElementById('root'));

// https://goo.gl/KwvDNy
registerServiceWorker();
