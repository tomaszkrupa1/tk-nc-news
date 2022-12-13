const { selectTopics, selectArticles } = require("../models/model.js");

exports.getTopics = (req, res) => {
  selectTopics().then((topic) => {
    res.status(200).send(topic);
  });
};

exports.getArticles = (req, res) => {
  selectArticles().then((article) => {
    res.status(200).send(article);
  });
};
