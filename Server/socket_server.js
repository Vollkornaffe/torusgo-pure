// get the environment variables defined in CONFIG.env
require('dotenv').config({path: '../CONFIG.env'});

let https     = require('https');
let http      = require('http'); // for local testing only

let fs        = require('fs');
let mysql     = require('promise-mysql');
let bcrypt    = require('bcrypt');

let app;

// setup http server and socket
if (process.env.PRODUCTION === "1")
{
    app = https.createServer({
        key:    fs.readFileSync(process.env.SLL_KEY),
        cert:   fs.readFileSync(process.env.SLL_CERT),
        ca:     fs.readFileSync(process.env.SLL_CA)
    });
} else {
    app = http.createServer();
}

let io = require('socket.io').listen(app);

// setup & test database connection
let db_credentials = {
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
};
mysql.createConnection(db_credentials)
    .then((conn) => {
        console.log("GREAT NEWS connection to DB established! GREAT NEWS");
    })
    .catch((err) => {
        if (connection && connection.end) connection.end();
        console.log(err);
    });

// setup user table
if (process.env.PRODUCTION !== "1")
{
    let connection;
    mysql.createConnection(db_credentials)
        .then((conn) => {
            connection = conn;
        })
        .then(() => {
            let sql = 'CREATE TABLE IF NOT EXISTS users (';
                sql += 'id INT NOT NULL AUTO_INCREMENT,';
                sql += 'username VARCHAR(32) NOT NULL,';
                sql += 'password_hash VARCHAR(60) NOT NULL,';
                sql += 'email VARCHAR(254) NOT NULL,';
                sql += 'PRIMARY KEY (id)';
                sql += ');';
            return connection.query(sql);
        })
        .catch((err) => {
            if (connection && connection.end) connection.end();
            console.log(err);
        });
}

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

let authentificate = (credentials, socket) => {
  let connection;
  let userEntry;
  const {username, password} = credentials;
  mysql.createConnection(db_credentials)
    .then((conn) => {
      connection = conn;
    })
    .then(() => {
      let sql = "SELECT * FROM users WHERE username = ?;";
      sql = mysql.format(sql, [username]);
      return connection.query(sql);
    })
    .then((res) => {
      if (res.length === 0) {
        throw {name: "FeedbackError", message: "Username not found."};
      } else {
        userEntry = res[0];
      }
    })
    .then(() => {
      return bcrypt.compare(password, stored_password_hash);
    })
    .then((res) => {
      if (res === true) {
        // TODO sign logintoken
        socket.emit("success", "Authentification success.");
      } else {
        throw {name: "FeedbackError", message: "Password incorrect."};
      }
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
let template_credentials = {username: "username", password: "password"};

io.on('connection', (socket) => {
  socket.on('account creation', (accountData) => {
    checkPayloadWithCallback(accountData, template_accountData, socket, () => {register_user(accountData, socket);});
  });

  socket.on('token request', (tokenPacket) => {
   if ('tokentype' in tokenPacket) {
    let tokentype = sanitizer.sanitize(tokenPacket.tokentype);
    switch (tokentype) {
     case 'userid':
      checkPayloadWithCallback(accountData, template_credentials, socket, () => {authentificate(tockenPacket, socket);});
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
