const Sequelize = require("sequelize");
const db = require("../../startup/db");

const room_player = db.define(
  "room_player",
  {
    room_id: {
      type: Sequelize.INTEGER,
      foreignKey: true,
    },
    player_id: {
      type: Sequelize.INTEGER,
      foreignKey: true,
    },
    player_points: {
      type: Sequelize.INTEGER, 
      defaultValue: 0,
    },
    player_2_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    player_2: Sequelize.INTEGER,
    play_count: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    winner: {
      type: Sequelize.VIRTUAL,
      get() {
        if (this.player_points > this.player_2_points) {
          return this.player_id;
        } else if (this.player_points < this.player_2_points) {
          return this.player_2;
        } else {
          return "Draw";
        }
      },
    },
  },
  {
    tableName: "room_player",
  }
);

module.exports = room_player;
