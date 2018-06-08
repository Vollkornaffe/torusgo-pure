A _session_ persists as long as the socket.io connection persists. A session can be in one of three _login states_: 'undefined', 'user', 'guest'. The initial login state is 'undefined'.

### Client Events `(name, payload)`

The server accepts events depending on the login state of the session. When an event inappropriate for the current login state is received, an `event_error` event is emitted.

#### 'undefined'

* `login_credentials, { username: '', password: '' }`

  Username and password are required.
  
  On successful authentication, the login state changes to 'user' and the server emits `login_success`, `token_change`, `user_change` and `state_change` events, in this order.
  
  On failure, the login state remains 'undefined' and the server emits a `login_error` event.

* `login_token, <token>`
  
  `<token>` is the JWT stored in the client's `localStorage`.
  
  On successful token verification, the login state changes to 'user' or 'guest', depending on the usre type associated with the token. The server emits `login_success`, `token_change`, `user_change` and `state_change` events, in this order.
  
  On failure, the login state remains 'undefined' and the server emits a `login_error` event.

* `login_guest`

  The Server creates a new guest user, changes the login state to 'guest' and emits `token_change`, `user_change` and `state_change` events, in this order.
   
* `register, {username: '', email: '', password: '', ...}`

  Password, email and username are required, optional data may be added in future.
  
  The server creates a new user. 
  
  On success, the login state changes to 'user' and the server emits `register_success`, `token_change`, `user_change` and `state_change` events, in this order.
  
  On failure (e.g. when the username is taken), the login state remains 'undefined' and the server emits a `register_error` event.
   
#### 'guest'

* `upgrade, {username: '', email: '', password: '', ...}`

  Password, email and username are required, optional data may be added in future.

  The server changes the user type to regular (or whatever) and adds the provided data. 
  
  On success, the login state changes to 'user' and the server emits `upgrade_success`, `state_change` events, in this order.
  
  On failure (e.g. when the username is taken), the login state remains 'guest' and the server emits a `upgrade_error` event.

#### 'guest' or 'user'

* `logout`

  The server logs the user out, changes the login state to 'undefined' and emits a `state_change` event.

### Server Events `(name, payload)`

* `state_change, <state>`

  `<state>` can be 'undefined', 'user' or 'guest'. Refers to the login state of the session. Emitted whenever the server changes the state of the session (e.g. after successful token verification). Initially, the state of a session is 'undefined'.
  
* `token_change, <token>`

  `<token>` is the new token, which is then stored in the client's `localStorage`. 
    
* `user_change, <name>`

  `<id>` is the id of the user the client is logged in as.
  
* `login_success`

* `register_success`

* `upgrade_success`

* `login_error, <reason>`

  `<reason>` is optional and can be 'uesrname', 'password' or 'token'

* `register_error, <reason>`

  `<reason>` is optional and can be 'uesrname', 'email' or 'password'

* `upgrade_error, <reason>`

  `<reason>` is optional and can be 'uesrname', 'email' or 'password'

* `event_error, <event>`

  `<event>` is the name of the disallowed event
  
  
