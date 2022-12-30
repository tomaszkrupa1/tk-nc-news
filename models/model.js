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
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [id])
    .then(({ rows: article }) => {
      return article[0];
    })
    .then((article) => {
      if (article === undefined) {
        return Promise.reject({
          status: 404,
          message: "Not Found",
        });
      } else {
        return article;
      }
    });
};

exports.selectCommentsByArticleId = (id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [id])
    .then(({ rows: articles }) => {
      if (articles.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Non Existent ID",
        });
      } else {
        return db.query(
          "SELECT comment_id, body, votes, author, created_at FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
          [id]
        );
      }
    })
    .then(({ rows: comments }) => {
      return comments;
    });
};

exports.insertCommentByArticleId = (id, usernameAndBody) => {
  const insertQuery =
    "INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;";
  const { username, body } = usernameAndBody;
  const params = [id, username, body];

  return db.query(insertQuery, params).then(({ rows }) => {
    if (typeof body !== "string") {
      return Promise.reject({
        status: 400,
        message: "Bad Request",
      });
    }
    const comment = rows[0];
    return comment;
  });
};

exports.updateArticleVotes = (id, votesObj) => {
  const updateQuery =
    "UPDATE articles SET votes=votes+ $2 WHERE article_id = $1 RETURNING *;";
  const params = [id, votesObj.inc_votes];

  return db.query(updateQuery, params).then(({ rows: article }) => {
    if (article.length === 0) {
      return Promise.reject({
        status: 404,
        message: "Not Found",
      });
    } else {
      const firstArticle = article[0];
      return firstArticle;
    }
  });
};

exports.selectUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows }) => {
    return rows;
  });
};

exports.selectArticles = (topic, sort_by = "created_at", order = "DESC") => {
  if (!["asc", "desc", "ASC", "DESC"].includes(order)) {
    return Promise.reject({ status: 400, message: "Invalid order Query" });
  }
  if (
    !["article_id", "created_at", "votes", "comment_count"].includes(sort_by)
  ) {
    return Promise.reject({ status: 400, message: "Invalid sort_by Query" });
  }
  return db
    .query("SELECT slug FROM topics;")
    .then(({ rows }) => {
      const topicSlugs = [undefined];
      rows.forEach((topic) => topicSlugs.push(topic.slug));
      if (!topicSlugs.includes(topic)) {
        return Promise.reject({ status: 400, message: "Invalid topic Query" });
      }
      return rows[0];
    })
    .then(() => {
      let articleQuery;
      if (!topic) {
        articleQuery = `SELECT articles.*, CAST(COUNT(comments.article_id) AS INT) AS comment_count     FROM articles      LEFT JOIN comments       ON articles.article_id = comments.article_id      GROUP BY articles.article_id       ORDER BY ${sort_by} ${order};`;
      } else {
        articleQuery = `SELECT articles.*, CAST(COUNT(comments.article_id) AS INT) AS comment_count     FROM articles      LEFT JOIN comments       ON articles.article_id = comments.article_id   WHERE  topic = '${topic}' GROUP BY articles.article_id       ORDER BY ${sort_by} ${order};`;
      }

      return db.query(articleQuery);
    })
    .then(({ rows }) => {
      return rows;
    });
};