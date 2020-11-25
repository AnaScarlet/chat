const { time } = require('console');
var randomWords = require('random-words');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 8988;

let colors = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgrey", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"];
const EMPTY_MESSAGE = "EMPTY";

class Message {
  constructor( username, message, colorCode, timestamp ) {
    this.username = username;
    this.message = message;
    this.colorCode = colorCode;
    this.timestamp = timestamp;
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
  
  clone() {
    let newUser = new User();
    newUser.username = this.username;
    newUser.colorCode = this.colorCode;
    newUser.isOnline = this.isOnline;
    return newUser;
  }
}

class SocketReturnObject {
  constructor(messages, errorMessage, users, nameChanged, colorChanged, currentUserName, newName) {
    this.messages = messages;
    this.errorMessage = errorMessage;
    this.users = users;
    this.nameChanged = nameChanged;
    this.colorChanged = colorChanged;
    this.currentUserName = currentUserName;
    this.newName = newName;
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

function removeOnlineUser(userRm) {
  let currentUserOnlineUsersListIndex = onlineUsersList.findIndex((user) => user.username === userRm.username);
  if (currentUserOnlineUsersListIndex !== -1) {
    console.log(`INFO: Found extra user ${userRm.username} : ${currentUserOnlineUsersListIndex}. Removing from Online User List`);
    let user = onlineUsersList[currentUserOnlineUsersListIndex];
    user.setOffline();
    onlineUsersList.splice(currentUserOnlineUsersListIndex, 1);
  }
}

function removeUser(userRm) {
  let currentUserUserListIndex = usersList.findIndex((user) => user.username === userRm.username);
  if (currentUserUserListIndex !== -1) {
    console.log(`INFO: Found extra user ${userRm.username} : ${currentUserUserListIndex}. Removing from User List`);
    usersList.splice(currentUserUserListIndex, 1);
  }
  removeOnlineUser(userRm);
}

function searchAndReplaceEmojis(emojiReplaceMessage) {
  if (emojiReplaceMessage.indexOf(":)") !== -1) {
    emojiReplaceMessage = emojiReplaceMessage.replace(/:\)/g, "😊");
  }
  if (emojiReplaceMessage.indexOf(":D") !== -1) {
    emojiReplaceMessage = emojiReplaceMessage.replace(/:D/g, "😃");
  }
  if (emojiReplaceMessage.indexOf(":P") !== -1) {
    emojiReplaceMessage = emojiReplaceMessage.replace(/:P/g, "😝");
  }
  if (emojiReplaceMessage.indexOf("<3") !== -1) {
    emojiReplaceMessage = emojiReplaceMessage.replace(/<3/g, "❤️");
  }
  if (emojiReplaceMessage.indexOf(":(") !== -1) {
    emojiReplaceMessage = emojiReplaceMessage.replace(/:\(/g, "🙁");
  }
  if (emojiReplaceMessage.indexOf(":/") !== -1) {
    emojiReplaceMessage = emojiReplaceMessage.replace(/:\//g, "😕");
  }
  if (emojiReplaceMessage.indexOf(":*") !== -1) {
    emojiReplaceMessage = emojiReplaceMessage.replace(/:\*/g, "😘");
  }
  if (emojiReplaceMessage.indexOf("8)") !== -1) {
    emojiReplaceMessage = emojiReplaceMessage.replace(/8\)/g, "🤓");
  }
  if (emojiReplaceMessage.indexOf(";)") !== -1) {
    emojiReplaceMessage = emojiReplaceMessage.replace(/;\)/g, "😉");
  }
  if (emojiReplaceMessage.indexOf(":O") !== -1) {
    emojiReplaceMessage = emojiReplaceMessage.replace(/:O/g, "😮");
  }
  return emojiReplaceMessage;
}

function checkMessage(messageText) {
  let returnObject = {newName: "", newColor: "", errorMessage: "", newMessage: ""};
  let nameCommandIndex = messageText.indexOf("/name");
  if (nameCommandIndex !== -1) {
    let newName = messageText.slice(nameCommandIndex+5).trim();
    if (newName.indexOf("/name") !== -1) {
      //console.log("The new name had more name commands in it! Getting rid of the rest of the string.");
      newName = newName.slice(0, newName.indexOf("/name")).trim();
      returnObject.errorMessage += "You cannot use multiple /name commands at the same time.\n";
    }
    let nameSplit = newName.split(" ");
    if (nameSplit.length !== 1) {
      newName = nameSplit[0];
      returnObject.errorMessage += "You cannot have a space in your name.\n";
    }
    returnObject.newName = newName;
    returnObject.newMessage = EMPTY_MESSAGE;
  }

  let colorCommandIndex = messageText.indexOf("/color");
  if (colorCommandIndex !== -1) {
    let newColor = messageText.slice(colorCommandIndex+6).trim();
    if (newColor.indexOf("/color") !== -1) {
      newColor = newColor.slice(0, newColor.indexOf("/color")).trim();
      returnObject.errorMessage += "You cannot use multiple /color commands at the same time.\n";
    }
    if (!colors.includes(newColor)) {
      newColor = "";
      returnObject.errorMessage += "You have selected an unsupported color. Please use a color name from the list of CSS Color Names.\n";
    }
    returnObject.newColor = newColor;
    returnObject.newMessage = EMPTY_MESSAGE;
  }

  if (messageText.indexOf("<script>") !== -1) {
    returnObject.newMessage = EMPTY_MESSAGE;
    returnObject.errorMessage += "Attack thwarted!";
  }
  
  if (returnObject.newMessage !== EMPTY_MESSAGE) {
    let emojiReplaceMessage = messageText;
    returnObject.newMessage = searchAndReplaceEmojis(emojiReplaceMessage);
  }

  return returnObject;
}

function rejoinUser(username, currentUser) {
  let newCurrentUser = usersList.find( (user) => username === user.username );
  if (newCurrentUser !== undefined) {
    console.log(`currentUser.username = ${currentUser.username}`);
    removeUser(currentUser);
    currentUser = newCurrentUser;
    currentUser.setOnline();
    filterOnlineUsers();
    console.log("Updated Online Users list:");
    console.log(onlineUsersList);
    console.log("\n");
    io.emit('rejoin', onlineUsersList);
    return newCurrentUser;
  }
  else {
    console.log("WARNING: could not find rejoining user in the users list.");
    return currentUser;
  }
}

function rejoinUserWithClone(username, currentUser) {
  let newCurrentUser = usersList.find( (user) => username === user.username );
  let cloneNewCurrentUser = newCurrentUser.clone();
  if (newCurrentUser !== undefined) {
    console.log(`currentUser.username = ${currentUser.username}`);
    removeUser(currentUser);
    cloneNewCurrentUser.setOnline(); //shouldn't need this...
    onlineUsersList.push(cloneNewCurrentUser);
    usersList.push(cloneNewCurrentUser);
    filterOnlineUsers();
    console.log("Updated Online Users list:");
    console.log(onlineUsersList);
    console.log("\n");
    io.emit('rejoin', onlineUsersList);
    return cloneNewCurrentUser;
  }
  else {
    console.log("WARNING: could not find rejoining user in the users list.");
    return currentUser;
  }
}

let usersList = [];
let onlineUsersList;
let messagesList = [];
let presentUsers = [];


// connection and disconnect are default events from socket.io
// socket is an object that will represent the client that connected
io.on('connection', function(socket){
  let currentUser = new User();
  console.log(`User connected. Username: ${currentUser.username}; Color: ${currentUser.colorCode}`);
  usersList.push(currentUser);
  filterOnlineUsers();
  let returnObject = new SocketReturnObject(messagesList, "", onlineUsersList, false, false, currentUser.username, "");

  io.emit('join', returnObject);

  socket.on('join', function (cookieUsername) {
    let cookieUserExistsInOnlineUsersList = onlineUsersList.findIndex(user => user.username === cookieUsername);
    let cookieUserExistsInUsersList = usersList.findIndex(user => user.username === cookieUsername);
    if (cookieUserExistsInOnlineUsersList !== -1 && cookieUserExistsInUsersList !== -1) {
      console.log("INFO: Joining user is in both usersList and onlineUsersList.");
      if (cookieUsername === currentUser.username) {
        console.log("\tCurrent user's username is the same as cookie username. All is well.");
      }
      else {
        console.log("\tCurrent user's username is NOT the same as cookie username.");
        console.log("\tAssume cookie is corrent and rejoin user.");  
        currentUser = rejoinUserWithClone(cookieUsername, currentUser);
        console.log("Updated current user:");
        console.log(currentUser);
      }
    }
    else if (cookieUserExistsInUsersList !== -1 && cookieUserExistsInOnlineUsersList === -1) {
      console.log("INFO: User is in usersList but not in onlineUsersList. It's a rejoining user.");
      currentUser = rejoinUser(cookieUsername, currentUser);
      console.log("Updated current user:");
      console.log(currentUser);
    }
    else {
      console.log("WARNING: Something werid with the username stored in the client's cookie.");
    }
  });

  // Poll current users to see if they're actually there.
  // Case where this fixes a bug: opening a new tab while still logged in in a different tab.
  // The bug: the new tab generates a new username. This username ends up in the onlineUsersList.
  //          No way to differentiate between this and an actual new user joining...
  // Another case: username changes/ user opens a new tab, so this socket's currentUser is not representative of the user object.
  //          When the connectiono closes, it removes the wrong user from the list...
  // let pollingIntervalId = setInterval(() => {
  //   for (user of onlineUsersList) {
  //     io.sockets.emit("user poll", user.username);
  //   }
  //   // Wait for a minute for them to respond
  //   setTimeout(() => {
  //     console.log("Removing inactive users.")
  //     for (user of onlineUsersList) {
  //       if (!presentUsers.includes(user.username)) {
  //         console.log("Found an incative user.");
  //         removeOnlineUser(user);
  //       }
  //     }
  //     presentUsers = [];
  //     console.log("Online users list:");
  //     console.log(onlineUsersList);

  //     io.sockets.emit("users update", onlineUsersList);
  //   }, 10000);  // wait for users to respond
  // }, 100000); // poll every 100 seconds

  // socket.on("user poll", function (userIsMe, polledUsername) {
  //   if (userIsMe === true) {
  //     console.log(polledUsername + " is present");
  //     presentUsers.push(polledUsername);
  //   }
  // });
  
  // 'chat message' is an event from this particular connected client
  socket.on('message', function(message, username){
    let currentUsername = username;
    let newUsername = "";
    let returnMessage = message;
    let returnColorCode = "";
    let nameChanged = false;
    let colorChanged = false;
    let now = new Date();
    let timestamp = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate() + " "+ now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

    let user = onlineUsersList.find(user => user.username === username);
    if (user === undefined) {
      console.log("Not able to find user in online users list. User probably needs to rejoin.....");
      return;
    }
    returnColorCode = user.colorCode;
    
    checkMessageObject = checkMessage(message);
    if (checkMessageObject.newMessage === EMPTY_MESSAGE) {
      returnMessage = "";
    }
    else if (checkMessageObject.newMessage) {
      returnMessage = checkMessageObject.newMessage;
    }
    if (checkMessageObject.newName) {
      newUsername = checkMessageObject.newName;
      user.username = checkMessageObject.newName;
      nameChanged = true;
    }
    if (checkMessageObject.newColor) {
      returnColorCode = checkMessageObject.newColor; // Note: Command messages don't get sent to the chat log
      user.colorCode = checkMessageObject.newColor;
      colorChanged = true;
    }
    if (checkMessageObject.errorMessage) {
      console.log(checkMessageObject.errorMessage); // Log it for debugging purpposes.
    }
    
    if (returnMessage) {
      let newMessage = new Message(currentUsername, returnMessage, returnColorCode, timestamp);
      messagesList.unshift(newMessage);
    }
    if (messagesList.length === 201) {
      messagesList.pop();
    }

    let returnObject = new SocketReturnObject(messagesList, checkMessageObject.errorMessage, 
      onlineUsersList, nameChanged, colorChanged, currentUsername, newUsername);

    // could use either io.emit() or socket.broadcast.emit()
    //     io.emit will publish to everyone, including the client that published the message
    //     socket.broadcast.emit will publish to everyone but the client that published the message
    io.emit('message', returnObject);
  });


  socket.on('disconnect', () => {
    console.log("User disconnected. Username: " + currentUser.username);
    //clearInterval(pollingIntervalId);
    currentUser.setOffline();
    onlineUsersList = usersList.slice(); //  copy array
    filterOutOfflineUsers(onlineUsersList);
    io.emit('leave', onlineUsersList);
  });

});


http.listen(port, function(){
  console.log('listening on *:' + port);
});
