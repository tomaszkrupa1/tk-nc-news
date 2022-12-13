const db = require("../db/connection.js");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics;`).then(({ rows: topics }) => {
    return topics;
  });
};

exports.selectArticles = () => {
  return db
    .query(
      "SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, CAST (COUNT(comments.article_id) AS INT) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id ORDER BY created_at DESC;"
    )
    .then(({ rows: articles }) => {
      return articles;
    });
};

exports.selectArticleById = (id) => {
  console.log("inthemodel");
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [id])
    .then(({ rows }) => {
      return rows[0];
    })
    .then((article) => {
      if (article === undefined) {
        return Promise.reject({
          status: 404,
          msg: "Not Found",
        });
      } else {
        return article;
      }
    });
};
