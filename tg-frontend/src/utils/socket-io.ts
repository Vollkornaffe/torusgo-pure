import {connect} from 'socket.io-client';
import {changeConnectionStatus, update} from '../redux/actions';

import store from '../redux/store';
import {EConnectionStatus} from '../types';

let url = 'http://localhost:3450/';

if (process.env.NODE_ENV === 'production') {
  url = 'https://torusgo.com:12345/';
}

const socket = connect(url);

const dispatcher = (status: EConnectionStatus) => () => store.dispatch(changeConnectionStatus(status));

// bind connection event listeners
socket.on('connect', dispatcher(EConnectionStatus.Connected));
socket.on('disconnect', dispatcher(EConnectionStatus.Disconnected));
socket.on('error', dispatcher(EConnectionStatus.Broken));

socket.on('update', (payload: any) => {
  store.dispatch(update(payload.type, payload.item, payload.id))
});

const withTimeout = (callback: (response: any) => void) => {
  let called = false;

  const interval = setTimeout(() => {
    if (called) {
      return;
    }
    called = true;
    clearTimeout(interval);

    callback({error: 'timeout_error', message: 'The request timed out'});
  }, 10 * 1000 /* 10 seconds */);

  return (response: any) => {
    if (called) {
      return;
    }
    called = true;
    clearTimeout(interval);

    callback(response);
  }
};

export const sendWithAck = (event: string, payload: any) => new Promise((resolve, reject) => {
  socket.emit(event, payload, withTimeout((response: any) => {
    if (response && response.error) {
      reject(response);
    } else {
      resolve(response);
    }
  }));
});

export const send = (event: string, payload: any) => {
  socket.emit(event, payload);
};