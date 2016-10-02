var express = require('express');
var http = require('http');
var io = require('socket.io');
var connections = 0;

var app = express();
var server = http.createServer(app);
io = io.listen(server);

app.set('port', process.env.PORT || 3000);
app.set('views', 'views');
app.set('view engine', 'jade');
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render('index');
});


io.sockets.on('connection', function (socket) {
    
    connections++;
    console.log('connected', connections);
    socket.broadcast.emit('connections', {connections:connections});
    
    socket.on('mousemove', function (data) {
      socket.broadcast.emit('move', data); 
    });
    
    socket.on('disconnect', function() {
        connections--;
        console.log('connected', connections);
        socket.broadcast.emit('connections', {connections:connections});
    });
    
    socket.on('disconnect', function() {
        connections--;
        console.log('disconnected');
        console.log('connected', connections);
        socket.broadcast.emit('connections', {connections:connections});
    });
});

server.listen(app.set('port'), function () {
   console.log('Express server listening on port ' + app.set('port')); 
});