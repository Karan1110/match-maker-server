
const Room = require("../models/room");
const Room_Player = require("../models/intermediate_models/room_player");
const sequelize = require("sequelize");

module.exports = function (app) {
  require("express-ws")(app);
  // Store WebSocket connections for each chat room
  const rooms = {};

  app.ws("/chat/:room_id/", async (ws, req) => {
    try {

      console.log("WebSocket connection established");
      const player_id = req.query.player_id;
      const room = req.params.room_id;

      if (!player_id) {
        return ws.close(4000, "Missing player_id");
      }

      // Check if the chat room exists, create a new one if it doesn't
      if (!rooms[room]) {
        rooms[room] = [];
      }
      let rp;
      // Add the WebSocket connection to the chat room
      rooms[room].push(ws);

      if (req.query.player1 === "true") {
       rp = await Room_Player.create({
          room_id: req.params.room_id,
          player_id : req.query.player_id
        });

        ws.player1 = player_id;
        ws.me = ws.player1;

      } else {
       rp = await Room_Player.findOne({
          room_id: req.params.room_id,
          player_id : req.query.player_id
        });

        await rp.update({
          player_2 : player_id
        });

        ws.player2 = player_id
        ws.me = ws.player2;
      }
      
      // Handle incoming msgs
// ...

      ws.on("message", async (message) => {
        const msg = JSON.parse(message);
  if (ws.me === ws.player1) {
    // Check if ws.player_2 is not set or null
    if (ws.player_2 == null || undefined) {
      const rpp = await Room_Player.findOne({
        where: {
          room_id: req.params.room_id,
          player_id: req.query.player_id
        }
      });
  
      // Update ws.player_2 and perform actions accordingly
      ws.player_2 = rpp.dataValues.player_2;
  
      if (ws.player_2 === null) {
        rooms[room].forEach(connection => {
          connection.send(
            JSON.stringify({
              msg: "No player-2!"
            })
          );
        });
      } else if (msg.normalChat) {
        rooms[room].forEach(connection => {
          connection.send(
            JSON.stringify({
              msg: msg
            })
          );
        });
      } else if (msg.updatePP) {
        rooms[room].forEach(connection => {
          connection.send(
            JSON.stringify({
              msg: "updated player_2 points...",
              sent_by: ws.me,
              isRead: false
            })
          );
        });
        await rp.update({
          player_points: sequelize.literal('player_points + 1')
        });
      }
    } else {
      if (msg.normalChat == true || "true") {
        rooms[room].forEach(connection => {
          connection.send(
            JSON.stringify({
              msg: msg
            })
          );
        });
      } else if (msg.updatePP == true || "true") {
        rooms[room].forEach(connection => {
          connection.send(
            JSON.stringify({
              msg: "updated player_2 points...",
              sent_by: ws.me,
              isRead: false
            })
          );
        });
        await rp.update({
          player_points: sequelize.literal('player_points + 1')
        });
      }
    }
  } else {
    // Rest of your code
    if (msg.normalChat) {
      rooms[room].forEach(connection => {
        connection.send(
          JSON.stringify({
            msg: msg
          })
        );
      });
    } else if (msg.updatePP) {
      rooms[room].forEach(connection => {
        connection.send(
          JSON.stringify({
            msg: "updated player_2 points...",
            sent_by: ws.me,
            isRead: false
          })
        );
      });
      await rp.update({
        player_points: sequelize.literal('player_points + 1')
      });
    }
  }
});
      
      ws.on("close", async () => {
        // Remove the WebSocket connection from the chat room
        rooms[room] = rooms[room].filter(connection => connection !== ws);
      });
    } catch (ex) {
      console.log(ex);
      ws.close(4000, ex.message);
    }
  });
};