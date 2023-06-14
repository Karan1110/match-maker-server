const express = require(`express`);
const matchMake = require("../routes/matchMake");

module.exports = function (app) {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use('/matchMe', matchMake);
}