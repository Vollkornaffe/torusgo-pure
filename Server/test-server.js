const io = require('socket.io')(3450);

const userToken = '65495165490462105640986';

const guestToken = '64987651321654987621312';

const user = {
  id: 'abc123',
  isGuest: false,
  name: 'Lukas',
  password: 'hunter2',
  rank: 'Global Elite',
};

const guest = {
  id: 'guest456',
  isGuest: true,
  name: 'Guest456',
};

const EventError = {
  error: 'event_error',
  message: 'wrong login state to do this',
};

const LoginError = {
  error: 'login_error',
  message: 'invalid credentials',
};

const RegisterError = {
  error: 'register_error',
  message: 'invalid data',
};

const UpgradeError = {
  error: 'upgrade_error',
  message: 'invalid data',
};

const NotFoundError = {
  error: 'not_found_error',
  message: 'requested resource not available',
};

io.on('connection', function (socket) {
  console.log('connection');

  let loginState = 'undefined';

  socket.on('login_token', (token, res) => {
    if(loginState !== 'undefined') return res(EventError);

    if(token === userToken) {
      loginState = 'user';

      res({
        id: user.id,
        loginState,
      });
    } else if (token === guestToken) {
      loginState = 'guest';

      res({
        id: guest.id,
        loginState,
      });
    } else {
      res(LoginError);
    }
  });

  socket.on('login_credentials', (payload, res) => {
    if(loginState !== 'undefined') return res(EventError);

    if(payload.username !== user.name) return res(LoginError);
    if(payload.password !== user.password) return res(LoginError);

    loginState = 'user';
    res({
      token: userToken,
      id: user.id,
    });
  });

  socket.on('login_guest', (payload, res) => {
    if(loginState !== 'undefined') return res(EventError);
    loginState = 'guest';
    res({
      token: guestToken,
      id: guest.id,
    });
  });

  socket.on('logout', (payload, res) => {
    if(loginState === 'undefined') return res(EventError);
    loginState = 'undefined';
    res(null);
  });

  socket.on('subscribe', (payload, res) => {
    if(loginState === 'undefined') return res(EventError);
    if(payload.type !== 'user') return res(NotFoundError);
    if(payload.id === user.id) {
      res(user);
    } else if(payload.id === guest.id) {
      res(guest);
    } else {
      res(NotFoundError);
    }
  });

  socket.on('unsubscribe', (payload, res) => {
    if(loginState === 'undefined') return res(EventError);
    res(null);
  });

});

console.log('ready');