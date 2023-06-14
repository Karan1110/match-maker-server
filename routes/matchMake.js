const { Op } = require("sequelize");
const sequelize = require("sequelize");
const db = require("../startup/db");
const Player = require("../models/player");
const Room_Player = require("../models/intermediate_models/room_player");
const Room = require("../models/room");
const router = require("express").Router();

router.post("/matchMe", async (req, res) => {
  const t = await db.transaction({
    isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });

  try {
    let player;
    let room;

    player = await Player.findOne({
      where: { name: req.body.name },
      transaction: t,
    });

    if (!player) {
      player = await Player.create(
        {
          name: req.body.name,
        },
        { transaction: t }
      );
    }

    room = await Room.findOne({
      where: {
        player_count: 1,
      },
      transaction: t,
    });

    if (!room) {
      room = await Room.create(
        {
          name: "test_room",
        },
        { transaction: t }
      );
      await t.commit();
      return res.status(201).send({
        redirect: `/${room.dataValues.id}?player1=true`,
        player_id: player.dataValues.id,
      });
    }

    await t.commit();

    res.status(201).send({
      redirect: `/${room.dataValues.id}?player1=false`,
      player_id: player.dataValues.id,
    });
  } catch (ex) {
    await t.rollback();
    console.log(ex);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
