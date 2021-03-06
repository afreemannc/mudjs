var Command = function() {
  this.trigger = 'talker';
  this.permsRequired = 'HASTALKER';
  this.helpText = `
  Use the talker chat system. Requires a talker item to use.

  %yellow%Usage:%yellow%
         talker say <message>     (chat on current channel)
         talker channel <channel> (change channel)
         talker channels          (list available channels)
         talker on                (turn talker on)
         talker off               (turn talker off)

  %yellow%Example:%yellow%
         > talker channel thieves
         >
         > %bold%Talker channel set to "%green%thieves%green%"%bold%
         >
         > talker say hi
         >
         > %green%[thieves] Derp says 'hi'%green%
  `;
  this.callback = function (session, input) {
    if (input.includes('say ')) {
      message = input.replace('say ', '');

      if (session.character.perms.includes('TALKERON') === false) {
        session.error('Nothing happens. You might want to turn it on first.');
        return false;
      }

      if (typeof session.talkerChannel === 'undefined') {
        session.error('Nothing happens. You need to set it to a channel.');
        return false;
      }
      var channel = session.talkerChannel;
      Modules.modules.Talker.write(session, message, channel);
      return true;
    }

    else if (input === 'on') {
      // turn talker on
      if (session.character.perms.includes('TALKERON')) {
        session.write('It is already on.');
        return false;

      }
      else {
        session.character.perms.push('TALKERON');
        session.write('You turn it on.');
        return true;
      }
    }
    else if (input === 'off') {
      // turn talker off
      var index = session.character.perms.indexOf('TALKERON');
      if (index === false) {
        session.write('Your talker is already off.');
        return false;
      }
      else {
        session.character.perms.splice(index, 1);
        session.write('You turn your talker off.');
        return true;
      }
    }
    else if (input.includes('channel ')) {
      var channel = input.replace('channel ', '');
      // confirm channel exists and player can access it
      // change channel
      session.talkerChannel = channel;
      // display change message
    }
    else if (input === 'channels') {
      // List channels available to character.
    }
  }
}

module.exports = new Command();
