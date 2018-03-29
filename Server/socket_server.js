let SOCKET_PORT = process.env.SOCKET_PORT;

let https = require('https');
let fs    = require('fs');
let sanitizer = require('sanitizer');

let app = https.createServer({
    key:    fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/privkey.pem'),
    cert:   fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/fullchain.pem'),
    ca:     fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/chain.pem')
});
let io = require('socket.io').listen(app);

io.on('connection', (socket) => {
    socket.on('token request', (tokenPacket) => {
      if ('tokentype' in tokenPacket) {
        let tokentype = sanitizer.sanitize(tokenPacket.tokentype);
        switch (tokentype) {
          case 'userid':
            socket.emit('token provision', {
              token: 'asdf'
            });
            break;
          default:
            socket.emit('failure', 'tokentype not recognised');
        }
        return;
      }
      socket.emit('failure', 'tokentype missing');
    });

    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});

app.listen(SOCKET_PORT, () => {
    console.log('socket listening on *: ', SOCKET_PORT);
});
