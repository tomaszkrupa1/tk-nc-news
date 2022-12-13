const express = require("express");
const { getTopics, getArticles } = require("./controllers/controller.js");

const app = express();

app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);

module.exports = app;
