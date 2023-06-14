const Sequelize = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const db = new Sequelize(process.env.dbURL);

module.exports = db;