const express = require("express");
const app = express();
const db = require("./startup/db");

require(`./startup/routes`)(app);
require(`./web-sockets/rooms`)(app);

db.authenticate({ force: true })
  .then(() => { 
    console.log("Database connected...");
    db.sync({ force: true })
      .then(() => {
        console.log("Tables created....");
      })
      .catch((ex) => {
        console.log("Tables NOT created...", ex);
      });
  })
  .catch((ex) => {
    winston.error("Database NOT connected...", ex);
  });
app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
