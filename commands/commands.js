function Commands() {
  this.commands = {};
  this.triggers = {};
  // Load core commands
  var normalizedPath = require("path").join(__dirname, "core");

  var coreCommands = require("fs").readdirSync(normalizedPath)
  for(i = 0; i < coreCommands.length; ++i) {
    command = require("./core/" + coreCommands[i]);
    this.commands[command.trigger] = command;
    this.triggers[command.trigger] = command.callback;
  }

  // Load optional plugins
  normalizedPath = require("path").join(__dirname, "plugins");

  var pluginCommands = require("fs").readdirSync(normalizedPath);
  for(i = 0; i < pluginCommands.length; ++i) {
    command = require("./plugin/" + pluginCommands[i]);
    // Intentionally skipping checks for pre-existing commands.
    // This permits individual implementations to override core command
    // behavior by declaring a custom version of the command in the
    // plugins directory.
    this.commands[command.trigger] = command;
    this.triggers[command.trigger] = command.callback;
  }

  this.commandHandler  = function(socket, inputRaw, connection) {
    var commandSegments = inputRaw.split(' ');
    var command = commandSegments[0];
    commandSegments.splice(0, 1);
    var arg = commandSegments.join(' ');
    // If input matches an exit label for the current room treat as move.
    if (global.rooms.inputIsExit(socket, inputRaw) === true) {
      return;
    }

    if (typeof this.commands[command] !== 'undefined') {
      console.log('activating callback for command: ' + command);
      this.triggers[command](socket, arg);
    }
    else {
       socket.write('wut\n');
    }
  }
}

module.exports = new Commands();