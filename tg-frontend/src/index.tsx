import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {resizeWindow} from './redux/actions';
import store from './redux/store';
import registerServiceWorker from './registerServiceWorker';

const handleResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  store.dispatch(resizeWindow(width, height));
};

window.addEventListener('resize', handleResize);

handleResize();

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
