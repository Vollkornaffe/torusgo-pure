let SOCKET_PORT = process.env.SOCKET_PORT;

let https = require('https');
let fs    = require('fs');
let sanitizer = require('sanitizer');

let mysql = require('promise-mysql');
let db_pool = promise_mysql.createPool({
    host     : 'example.org',
    user     : 'bob',
    password : 'secret',
    database : 'my_db'
});

let app = https.createServer({
    key:    fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/privkey.pem'),
    cert:   fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/fullchain.pem'),
    ca:     fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/chain.pem')
});
let io = require('socket.io').listen(app);

let register_user = (accountData, socket) => {
  const {username, password, email} = accountData;
  // first check whether username or email is duplicate
  let sql_check_dup = "FROM users SELECT 1 WHERE username = ? OR email = ?";
  sql_check_dup = mysql.format(sql_check_dup, [username, email]);
  db_pool.query(sql_check_dup)
    .then((rows) => {
      if (rows.length !== 0) {
        if (rows[0].username === username) throw {name: "FeedbackError", message: "Username exists."};
        if (rows[0].email === email) throw {name: "FeedbackError", message: "Email exists."};
        throw {name: "FeedbackError", message: "Account creation failed, Error 0"};
      }
    })
    // TODO actually create account
    .then(() => {
      socket.emit("success", "Account was created.");
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "FeedbackError") {
        socket.emit("failure", err.message);
      }
    });
};

io.on('connection', (socket) => {
  let failure = (err, msgForClient) => {
    console.log(err);
    socket.emit('failure', msgForClient);
  }

  socket.on('account creation', (accountData) => {
    
  });

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
