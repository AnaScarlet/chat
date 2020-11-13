var randomWords = require('random-words');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 8988;

let colors = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgrey", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"];
const EMPTY_MESSAGE = "EMPTY";

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

function checkMessage(messageText) {
  let returnObject = {newName: "", newColor: "", errorMessage: "", newMessage: ""};
  let nameCommandIndex = messageText.indexOf("/name");
  if (nameCommandIndex !== -1) {
    let newName = messageText.slice(nameCommandIndex+5).trim();
    if (newName.indexOf("/name") !== -1) {
      console.log("The new name had more name commands in it! Getting rid of the rest of the string.");
      newName = newName.slice(0, newName.indexOf("/name")).trim();
      returnObject.errorMessage.concat("You cannot use multiple /name commands at the same time.\n");
    }
    let nameSplit = newName.split(" ");
    if (nameSplit.length !== 1) {
      newName = nameSplit[0];
      returnObject.errorMessage.concat("You cannot have a space in your name.\n");
    }
    console.log("New username = **" + newName + "**");
    returnObject.newName = newName;
    returnObject.newMessage = EMPTY_MESSAGE;
  }

  let colorCommandIndex = messageText.indexOf("/color");
  if (colorCommandIndex !== -1) {
    let newColor = messageText.slice(colorCommandIndex+6).trim();
    if (newColor.indexOf("/color") !== -1) {
      newColor = newColor.slice(0, newColor.indexOf("/color")).trim();
      returnObject.errorMessage.concat("You cannot use multiple /color commands at the same time.\n");
    }
    if (!colors.includes(newColor)) {
      newColor = "";
      returnObject.errorMessage.concat("You have selected an unsupported color. Please use a color name from the list of CSS Color Names.\n");
    }
    returnObject.newColor = newColor;
    returnObject.newMessage = EMPTY_MESSAGE;
  }

  if (messageText.indexOf("<script>") !== -1) {
    returnObject.newMessage = EMPTY_MESSAGE;
    returnObject.errorMessage.concat("Attack thwarted!");
  }
  if (messageText.indexOf("/ ") !== -1) {
    returnObject.errorMessage.concat("Empty command sequence detected. Don't use spaces after / for a valid command.\n");
  }

  return returnObject;
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
      console.log("Warning: could not find rejoining user in the users list. Re-adding the current user.");
      usersList.push(currentUser);
      onlineUsersList.push(currentUser);
    }
  });

  
  // 'chat message' is an event from this particular connected client
  socket.on('message', function(message){
    let returnUsername = currentUser.username;
    let returnMessage = message;
    let returnColorCode = currentUser.colorCode;
    
    checkMessageObject = checkMessage(message);
    if (checkMessageObject.newMessage === EMPTY_MESSAGE) {
      returnMessage = "";
    }
    if (checkMessageObject.newName) {
      // returnUsername = checkMessageObject.newName;  // Command messages don't get sent to the chat log
      currentUser.username = checkMessageObject.newName;
    }
    if (checkMessageObject.newColor) {
      // returnColorCode = checkMessageObject.newColor; // Command messages don't get sent to the chat log
      currentUser.colorCode = checkMessageObject.newColor
    }
    if (checkMessageObject.errorMessage) {
      console.log(checkMessageObject.errorMessage); // Just log it for now.
    }
    
    if (returnMessage) {
      let newMessage = new Message(returnUsername, returnMessage, returnColorCode);
      messagesList.unshift(newMessage);
    }
    if (messagesList.length === 201) {
      messagesList.pop();
    }
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
