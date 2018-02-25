var SOCKET_PORT = process.env.SOCKET_PORT;

var https = require('https');
var fs    = require('fs');

var options = {
    key:    fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/privkey.pem'),
    cert:   fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/fullchain.pem'),
    ca:     fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/chain.pem')
};

var app = https.createServer(options);
io = require('socket.io').listen(app);

io.on('connection', function(socket){
    io.emit('test message', 'You are connected!');

    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
});

app.listen(SOCKET_PORT, function(){
    console.log('socket listening on *: ', SOCKET_PORT);
});
