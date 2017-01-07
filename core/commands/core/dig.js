var Command = function() {
  this.trigger = 'dig';
  this.helpText = `
    The dig command is used to add rooms to a zone..
    When used several things happen in order:
      - a new empty room is created
      - exits are created linking the room you are in to this new room
      - you are moved to the new room

    %yellow%Usage:%yellow%
           dig <direction>

    %yellow%Example:%yellow%
          > dig e
          > dig d
  `;
  this.callback = function(session, input) {
    if (input.length === 0) {
      session.error('Dig where??\n');
    }
    else {
      var roomId = session.character.current_room;
      // It would be nonsensical to permit digging in a direction with a pre-existing exit.
      if (typeof Rooms.room[roomId].exits[input] !== 'undefined') {
        session.error('An exit already exists in that direction');
      }
      fieldValues = {
        zid: Zones.getCurrentZoneId,
        name: 'Empty space',
        full_description: 'Empty space just waiting to be filled. Remind you of Prom night?',
        flags: []
      }
      Rooms.saveRoom(session, fieldValues).then((response) => {
      var newRoom = response;
      // create exit from current room to new room.
      var exitValues = {
        rid: session.character.current_room,
        zid: Zones.getCurrentZoneId(socket),
        target_rid: newRoom.rid,
        label: input,
        description: 'Nothing to see here.',
        properties: [],
      }
      Rooms.saveExit(session, exitValues).then((response) => {
        //create reciprocal exit in new room. Flip values and save.
        exitValues.rid = newRoom.rid;
        exitValues.target_rid = session.character.current_room;
        exitValues.label = Rooms.invertExitLabel(input);
        Rooms.saveExit(socket, exitValues).then((response) => {
          // once exits are saved move the character to the new room.
          Commands.triggers.move(session, input);
       });
      }).catch(function(e) {
        console.log('reciprocal fail:' + e);
      });
      }).catch(function(e) {
        console.log('well that didnt work:' + e);
      });
    }
  }
}

module.exports = new Command();
