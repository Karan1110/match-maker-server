const Sequelize = require("sequelize");
const db = require("../../startup/db");

const room_player = db.define('room_player', {
    room_id: {
        type: Sequelize.INTEGER,
        forgeinKey : true
      },
      player_id: {
        type: Sequelize.INTEGER,
        forgeinKey : true 
      },
      player_points: {
        type: Sequelize.INTEGER,
        defaultValue : 0
        
      },
  player_2_points: {
      type: Sequelize.INTEGER,
      defaultValue : 0
  },
  player_2: Sequelize.INTEGER,
  play_count: {
    type: Sequelize.INTEGER,
    defaultValue : 0
  },
    winner: {
        type: Sequelize.VIRTUAL,
      get() {
        if (this.getDataValue('player_points') > this.getDataValue('player_2_points')) {
          return true;
      } else if (this.getDataValue('player_points') < this.getDataValue('player_2_points')){
          return false; 
        } else {
          return "Draw Game"
          }
        }
  }
}, {
  tableName : 'room_player'
});

module.exports = room_player;

/*
   app.ws(`matchMe`, async (ws, req) => {
        let room;
        room = await Room.findOne({
            where: {
                player_count: {
                    [Op.lte]: 2
                }
        }
        });
        
        if (room) {
            await Room.update(
                {
                  play_count: sequelize.literal('play_count + 1')
                },
                {
                  where: { id: room.dataValues.id }
                }
              );
              
}else if (!room) {
          room =   await Room.create({
                name: req.query.room_name
            });
}/// find existing room_player
        await room_player.create({
            player_id: player_id
        });
        
        const room_id = room.dataValues.id;
        const room_player_id = room_player.dataValues.id;

        ws.redirect(`/${room_id}?room_player_id=${room_player_id}`);

    });
    
*/