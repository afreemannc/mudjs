var net = require('net');
var mysql = require('mysql');
var session = require('./session');
var config = require('./config');
var commands = require('./commands');
var user = require('./user');
var rooms = require('./room');
var sockets = [];

var connection = mysql.createConnection({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPass,
  database: config.dbName,
  port: config.dbPort
});

connection.connect();

function newSocket(socket) {
  socket.playerSession = new session(socket);

  sockets.push(socket);
  user.start(socket);

  socket.on('data', function (data) {
    parseData(socket, data);
  });

  socket.on('end', function() {
    closeSocket(socket);
  });
}

// Initialize service and set listening port
var server = net.createServer(newSocket);
server.listen(config.port);
// TODO: move to session object, rely on this.socket as socket is passed during session creation.
function parseData(socket, data) {
  inputContext = socket.playerSession.getInputContext();
  switch (socket.playerSession.inputContext) {
    case 'prompt':
      // certain prompts require collection of multi-line inputs so raw data is provided here.
      socket.playerSession.prompt.promptHandler(input, connection);
      break;
    case 'command':
      // commands should only every be single line so data is sanitized to remove newline characters.
      var input = cleanInput(data);
      command.commandHandler(socket, input);
      break;
  }
}


/*
 * Cleans the input of carriage return, newline
 */
function cleanInput(data) {
  return data.toString().replace(/(\r\n|\n|\r)/gm,"");
}

function closeSocket(socket) {
  var i = sockets.indexOf(socket);
  if (i !== -1) {
    sockets.splice(i, 1);
  }
}
