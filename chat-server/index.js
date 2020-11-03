var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// connection and disconnect are default events from socket.io
// socket is an object that will represent the client that connected
io.on('connection', function(socket){
  // 'chat message' is an event from this particular connected client
  socket.on('chat message', function(msg){
    // could use either io.emit() or socket.broadcast.emit()
    //     io.emit will publish to everyone, including the client that published the message
    //     socket.broadcast.emit will publish to everyone but the client that published the message
    io.emit('chat message', msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
