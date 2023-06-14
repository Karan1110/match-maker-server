
const Room = require("../models/room");
const Room_Player = require("../models/intermediate_models/room_player");
const sequelize = require("sequelize");

module.exports = function (app) {
  require("express-ws")(app);
  // Store WebSocket connections for each chat room
  const rooms = {};

  app.ws("/chat/:room_id/", async (ws, req) => {
    try {
      const current_room = await Room.findOne({
        where: {
          id   : req.params.room_id
        }
      });

      console.log("WebSocket connection established");
      const player_id = req.query.player_id;
      const room = req.params.room_id;
// const 
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
        await current_room.update({
          current_player1 : req.query.player_id
        });
       rp = await Room_Player.create({
          room_id: req.params.room_id,
          player_id : req.query.player_id
        });

        ws.player1 = player_id;
        ws.me = ws.player1;
        ws.gameOn = true

      } else {
        await current_room.update({
          current_player2 : player_id
        });

       rp = await Room_Player.findOne({
          room_id: req.params.room_id,
          player_id :  current_room.dataValues.current_player1
        });

        await rp.update({
          player_2 : player_id
        });

        ws.player2 = player_id
        ws.me = ws.player2;
        ws.gameOn = true;
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

            if (rpp.dataValues.player_2 === null) {
              rooms[room].forEach(connection => {
                connection.send(
                  JSON.stringify({
                    msg: "No player-2!",
                    by : ws.me
                  })
                );
              });
            } else if (msg.normalChat) {
              rooms[room].forEach(connection => {
                connection.send(
                  JSON.stringify({
                    msg: msg,
                    by : ws.me
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
            } else if (msg.gameOver) {
              ws.gameOn = false;
            }
 
            ws.player_2 = rpp.dataValues.player_2;

          } else {
            if (msg.normalChat == true || "true") {
              rooms[room].forEach(connection => {
                connection.send(
                  JSON.stringify({
                    msg: msg,
                    by : ws.me
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
            } else if (
              msg.gameOver
            ) {
              ws.gameOn = false;
            }
          }
        }  else {
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
        player_points: sequelize.literal('player_2_points + 1')
      });
    }
    else if (msg.gameOver) {
      ws.gameOn = true;
    }
  }
});
      
      ws.on("close", async () => {
        // Remove the WebSocket connection from the chat room
        const cr = await Room.findOne({
          where: {
            id: req.params.room_id
          }
        });
        
        await cr.update({
          current_player1: null,
          current_player2: null
        });
        

        rooms[room] = rooms[room].filter(connection => connection !== ws);
        const otherPlayerWS = rooms[room].find(connection => connection !== ws);

        if (otherPlayerWS && (ws.gameOn === true || ws.gameOn === "true")) {
          // Notify the other player and close their WebSocket connection
          const winner = ws.me === ws.player1 ? ws.player1 : current_room.dataValues.current_player_2;

if(ws.me == ws.player1){
  await rp.update({
   player_points : 0
  });
} else {
  await rp.update({
   player_2_points : 0
  });
  
}
          otherPlayerWS.send(
            JSON.stringify({
              msg: "Other player disconnected.",
              winner: winner
            }));
          
          otherPlayerWS.send(JSON.stringify({
            message: "Game Over, You are the winner!"
          }));
          otherPlayerWS.close();
          
        } else if (otherPlayerWS) {
          const rp_temp = await Room_Player.findOne({
            where: {
              room_id: req.params.room_id,
              player_id: current_room.dataValues.player_id
            }
          });
  
          otherPlayerWS.send(JSON.stringify({
            winner: rp_temp
          }));
            otherPlayerWS.send(
              JSON.stringify({
                msg: "Other player disconnected."
              })
            );
            otherPlayerWS.send(JSON.stringify({
              message: "Game Over"
            }));
            otherPlayerWS.close();
        }

      });
    } catch (ex) {
      console.log(ex);
      ws.close(4000, ex.message);
    }
  });
};