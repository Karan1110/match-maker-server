const Sequelize = require("sequelize");
const db = require("../startup/db");

const room_player = db.define("Player", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [3, 50],
        msg: "Name must be between 3 and 50 characters",
      },
    },
  },
  will_chat: Sequelize.BOOLEAN,
});

module.exports = room_player;
