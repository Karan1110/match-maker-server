const Player = require("../models/player");
const router = require("express").Router();
const sequelize = require("sequelize");

router.post("/createRoom", async (req, res) => {
  try {
    const players = await Player.findAll({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id"))],
        "player_count",
      ],
      where: {},
    });

    const rooms = await Room.findAll({
      attributes: [[sequelize.fn("COUNT", sequelize.col("id"))], "rooms_count"],
      where: {},
    });

    while (
      players.dataValues.player_count * 2 !=
      rooms.dataValues.rooms_count
    ) {
      await Room.create({
        name: "test_name",
      });
    }
  } catch (ex) {
    console.log(ex);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
