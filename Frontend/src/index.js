import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {Reboot} from 'material-ui';
import logger from 'redux-logger';

import App from './components/App';

import uiReducer from './redux/ui-reducer';
import gameReducer from './redux/game-reducer';
import userReducer from './redux/user-reducer';

import {windowResize, addUser} from './redux/actions';
import registerServiceWorker from './registerServiceWorker';

const appReducer = combineReducers({
  users: userReducer,
  games: gameReducer,
  ui: uiReducer,
});

const store = createStore(appReducer, applyMiddleware(logger));

store.dispatch(addUser('default', 'Lukas'));


const handleResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  store.dispatch(windowResize(width, height));
};

window.addEventListener('resize', handleResize);
handleResize();

const Root = () => (
  <div>
    <Reboot/>
    <Provider store={store}>
      <Router>
        <Route path="/" component={App}/>
      </Router>
    </Provider>
  </div>
);

ReactDOM.render(<Root/>, document.getElementById('root'));

// https://goo.gl/KwvDNy
registerServiceWorker();
