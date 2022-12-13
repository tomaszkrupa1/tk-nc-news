const db = require("../db/connection.js");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics;`).then(({ rows: topics }) => {
    return { topics };
  });
};

exports.selectArticles = () => {
  return db
    .query(
      "SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, CAST (COUNT(comments.article_id) AS INT) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id ORDER BY created_at DESC;"
    )
    .then(({ rows: articles }) => {
      return { articles };
    });
};
