let SOCKET_PORT = process.env.SOCKET_PORT;

let https     = require('https');
let fs        = require('fs');
let sanitizer = require('sanitizer');
let mysql     = require('promise-mysql');
let bcrypt    = require('bcrytp');

let app = https.createServer({
    key:    fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/privkey.pem'),
    cert:   fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/fullchain.pem'),
    ca:     fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/chain.pem')
});

let io        = require('socket.io').listen(app);

let db_credentials = {
    host     : 'example.org',
    user     : 'bob',
    password : 'secret',
    database : 'my_db'
};


let register_user = (accountData, socket) => {
  let connection;
  const {username, password, email} = accountData;
  mysql.createConnection(db_credentials)
    .then((conn) => { 
      connection = conn;
    })
    .then(() => {
      // first check whether username or email is duplicate
      let sql = "SELECT * FROM users WHERE username = ? OR email = ?;";
      sql = mysql.format(sql, [username, email]);
      return connection.query(sql);
    })
    .then((duplicates) => {
      if (duplicates.length !== 0) {
        if (duplicates[0].username === username) throw {name: "FeedbackError", message: "Username in use."};
        if (duplicates[0].email === email) throw {name: "FeedbackError", message: "Email in use."};
      }
    })
    .then(() => {
      return bcrypt.hash(password, 10);
    })
    .then((password_hash) => {
      let sql = "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?);";
      sql = mysql.format(sql, [username, password_hash, email]);
      return connection.query(sql);
    })
    // TODO use userid to create logintoken
    .then(() => {
      socket.emit("success", "Account was created.");
    })
    .catch((err) => {
      if (connection && connection.end) connection.end();

      console.log(err);
      if (err.name === "FeedbackError") {
        socket.emit("failure", err.message);
      } else {
        socket.emit("failure", "DB error without feedback... try again later");
      }
    });
};

let checkPayload = (payload, template) => {
  let valid = true;
  let summary = {};
  for (let property in template) {
    if (template.hasOwnProperty(property)) {
      summary[property] = {};
      if (payload.hasOwnProperty(property)) {
        summary[property].exists = true;
        if (typeof template[property] === typeof payload[property]) {
          summary[property].typematch = true;
        } else {
          summary[property].typematch = false;
          valid = false;
        }
      } else {
        summary[property].missing = false;
        valid = false;
      }
    }
  }
  return {valid: valid, summary: summary};
};

let checkPayloadWithCallback = (payload, template, socket, callback) => {
  let payloadCheck = checkPayload(payload, template);
  if (payloadCheck.valid) {
    callback();
  } else {
    socket.emit('failure', "payloadcheck failed: " + JSON.stringify(payloadCheck.summary));
  }
}

// templates
let template_accountData = {username: "username", password: "password", email: "email"};

io.on('connection', (socket) => {
  socket.on('account creation', (accountData) => {
    let callback = () => {
      register_user(accountData, socket);
    };
    checkPayloadWithCallback(accountData, template_accountData, socket, callback);
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
