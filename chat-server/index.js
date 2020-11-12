var randomWords = require('random-words');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 8988;

class Message {
  constructor( username, message, colorCode ) {
    this.username = username;
    this.message = message;
    this.colorCode = colorCode;
  }
}

class User {
  constructor() {
    this.username = this.generateUsername();
    this.isOnline = true;
    this.colorCode = this.getRandomColor();
  }

  generateUsername() {
    let wordsArr = randomWords(2);
    let username = wordsArr[0] + "-" + wordsArr[1];
    return username;
  }

  // from https://stackoverflow.com/questions/1484506/random-color-generator
  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  setOffline() {
    this.isOnline = false;
  }
  setOnline() {
    this.isOnline = true;
  }
  
}

// Modifies the passed in array
function filterOutOfflineUsers(users) {
  let nextIndexToRemove = users.findIndex(element => element.isOnline === false);
  while(nextIndexToRemove != -1) {
    users.splice(nextIndexToRemove, 1);
    nextIndexToRemove = users.findIndex(element => element.isOnline === false);
  } 
}

function filterOnlineUsers() {
  onlineUsersList = usersList.slice(0, usersList.length); // copy array
  filterOutOfflineUsers(onlineUsersList);
}

function removeUser(userRm) {
  let currentUserUserListIndex = usersList.findIndex((user) => user.username === userRm.username);
  if (currentUserUserListIndex !== -1) {
    console.log(`Found rejoined user ${userRm.username}. Removing from User List`);
    usersList.splice(currentUserUserListIndex, 1);
    console.log("\t Users list:");
    console.log(usersList);
  }
  let currentUserOnlineUsersListIndex = onlineUsersList.findIndex((user) => user.username === userRm.username);
  if (currentUserOnlineUsersListIndex !== -1) {
    console.log(`Found rejoined user ${userRm.username}. Removing from Online User List`);
    onlineUsersList.splice(currentUserOnlineUsersListIndex, 1);
    console.log("\t Online Users list:");
    console.log(onlineUsersList);
  }
}

let usersList = [];
let onlineUsersList;
let messagesList = [];


// connection and disconnect are default events from socket.io
// socket is an object that will represent the client that connected
io.on('connection', function(socket){
  let currentUser = new User();
  console.log(`User connected. Username: ${currentUser.username}; Color: ${currentUser.colorCode}`);
  usersList.push(currentUser);
  filterOnlineUsers();
  let usersMessages = {users: onlineUsersList, currentUser: currentUser, messages: messagesList};
  

  io.emit('user-join', usersMessages);


  socket.on('user-rejoin', function(username) {
    removeUser(currentUser);
    
    newCurrentUser = usersList.find( (user) => username === user.username );
    if (newCurrentUser !== undefined) {
      currentUser = newCurrentUser;
      currentUser.setOnline();
      filterOnlineUsers();
      io.emit('user-rejoin', onlineUsersList);
    }
    else {
      console.log("Server Exception: could not find rejoining user in the users list. Re-adding the current user.");
      usersList.push(currentUser);
      onlineUsersList.push(currentUser);
    }
  });

  
  // 'chat message' is an event from this particular connected client
  socket.on('message', function(message){
    let newMessage = new Message(currentUser.username, message, currentUser.colorCode);
    messagesList.unshift(newMessage);
    // could use either io.emit() or socket.broadcast.emit()
    //     io.emit will publish to everyone, including the client that published the message
    //     socket.broadcast.emit will publish to everyone but the client that published the message
    io.emit('message', messagesList);
  });


  socket.on('disconnect', () => {
    console.log("User disconnected. Username: " + currentUser.username);
    currentUser.setOffline();
    onlineUsersList = usersList.slice(); //  copy array
    filterOutOfflineUsers(onlineUsersList);
    io.emit('user-leave', onlineUsersList);
  });

});


http.listen(port, function(){
  console.log('listening on *:' + port);
});
