import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import App from './App';
import './index.css';
import {keyPressUpdate, resizeWindow} from './redux/actions';
import store from './redux/store';
import registerServiceWorker from './registerServiceWorker';

const handleResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  resizeWindow(width, height);
};

window.addEventListener('resize', handleResize);

handleResize();

document.addEventListener('keydown', (event: KeyboardEvent) => {
  keyPressUpdate(event.code, true);
});
document.addEventListener('keyup', (event: KeyboardEvent) => {
  keyPressUpdate(event.code, false);
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
