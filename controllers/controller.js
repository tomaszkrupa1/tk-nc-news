const { selectTopics } = require("../models/model.js");

exports.getTopics = (req, res) => {
  selectTopics().then((topic) => {
    res.status(200).send( topic );
  });
};
