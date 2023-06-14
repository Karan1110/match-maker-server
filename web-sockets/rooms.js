
const Room = require("../models/room");
const Room_Player = require("../models/intermediate_models/room_player");

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

      // Add the WebSocket connection to the chat room
      rooms[room].push(ws);

      if (req.query.player1 === "true") {
        const new_rp = await Room_Player.create({
          room_id: req.params.room_id,
          player_id : req.query.player_id
        });

        ws.player1 = player_id;
        ws.me = ws.player1;

      } else {
        const rp = await Room_Player.findOne({
          room_id: req.params.room_id,
          player_id : req.query.player_id
        });

        await rp.update({
          player_2_id : player_id
        });

        ws.player2 = player_id
        ws.me = ws.player2;
      }
      
      // Handle incoming messages
      ws.on("message", async (msg) => {
        if (ws.me == ws.player1) {
          
          const rpp = await Room_Player.findOne({
            where: {
              room_id: req.params.room_id,
              player_id : req.query.player_id
            }
          });

          if (rpp.dataValues.player2 == null) {
            rooms[room].forEach(connection => {
              connection.send(
                JSON.stringify({
                  message: "No player_2!"
                })
              );
            });
          }

        } else {
          
          rooms[room].forEach(connection => {
            connection.send(
              JSON.stringify({
                message: msg,
                sent_by: player_id,
                isRead: false
              })
            );
          });
        }
        // Send the new message to all WebSocket connections in the chat room
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