var HTTP_PORT = process.env.HTTP_PORT;

var express = require('express');
var app     = express();
var http    = require('http').Server(app);

app.use('*', function(req, res, next){
    console.log(req.originalUrl);
    next();
});

app.use('/static', express.static(__dirname + '/build_frontend/static'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/build_frontend/index.html');
});

http.listen(HTTP_PORT, function(){
    console.log('http listening on *: ', HTTP_PORT);
});
