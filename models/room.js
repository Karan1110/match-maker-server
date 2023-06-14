const Sequelize = require("sequelize");
const db = require("../startup/db");
const Player = require("./player");
const room_player = require(`./intermediate_models/room_player`);

const Room = db.define('Room', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [3, 50],
                msg: 'Name must be between 3 and 50 characters'
            }
        } 
    },
    player_count: {
        type: Sequelize.INTEGER,
        defaultValue : 1 
    },
    gameType: {
        type: Sequelize.STRING,
        defaultValue : "general"
    },
    current_player1 : Sequelize.INTEGER,
    current_player2 : Sequelize.INTEGER
});
Room.belongsToMany(Player, {
    through: room_player,
    foreignKey: `player_id` 
}); 

Player.belongsToMany(Room, {
    through: room_player,
    foreignKey: `room_id`
});


module.exports = Room;