const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

afterAll(() => {
  if (db.end) db.end();
});

beforeEach(() => seed(data));

describe("1. GET /api/topics", () => {
  test("200: Should respond with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: topics }) => {
        const topicArr = topics.topics;
        expect(topicArr).toHaveLength(3);
        topicArr.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe("2. GET /api/articles", () => {
  test("200: Should respond with an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: articles }) => {
        const articlesArr = articles.articles;
        expect(articlesArr).toHaveLength(12);
        articlesArr.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
  it("200: Should return articles sorted by date descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(
          articles.every((article, index) => {
            return (
              index === 0 ||
              article.created_at <= articles[index - 1].created_at
            );
          })
        ).toBe(true);
      });
  });
});

describe("3. GET /api/articles/:article_id", () => {
  it("200: Should respond with the article object containing the corresponding article_id", () => {
    const articleId = 1;
    return request(app)
      .get(`/api/articles/${articleId}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: articleId,
            title: "Living in the shadow of a great man",
            author: "butter_bridge",
            body: "I find this existence challenging",
            topic: "mitch",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
          })
        );
      });
  });

  describe("Errors", () => {
    it("404: Should return a Not Found error when endpoint doesn't exist with the provided ID", () => {
      return request(app)
        .get("/api/articles/999999")
        .expect(404)
        .then((res) => {
          const body = res.body;
          expect(body).toEqual({ message: "Not Found" });
        });
    });

    it("400: Should return a 400 Bad Request error when endpoint provided an id that is the wrong data type", () => {
      return request(app)
        .get("/api/articles/shouldthrowbadrequest")
        .expect(400)
        .then((res) => {
          const body = res.body;
          expect(body).toEqual({ message: "Bad Request" });
        });
    });
  });
});

describe("4. GET /api/articles/:article_id/comments", () => {
  it("200: should respond with an empty array when there are no comments on the article", () => {
    const articleId = 7;
    return request(app)
      .get(`/api/articles/${articleId}/comments`)
      .expect(200)
      .then(({ body: comments }) => {
        const commentsArr = comments.comments;
        expect(commentsArr).toEqual([]);
      });
  });
});

it("200: Should respond with the comment object containing the corresponding comments to the article_id", () => {
  const articleId = 1;
  return request(app)
    .get(`/api/articles/${articleId}/comments`)
    .expect(200)
    .then(({ body: comments }) => {
      const commentsArr = comments.comments;
      commentsArr.forEach((comment) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
          })
        );
      });
    });
});

describe("Errors", () => {
  it("404: Should return a Not Found error when endpoint doesn't exist with the provided ID", () => {
    return request(app)
      .get("/api/articles/999999/comments")
      .expect(404)
      .then((res) => {
        const body = res.body;
        expect(body).toEqual({ message: "Non Existent ID" });
      });
  });

  it("400: Should return a 400 Bad Request error when endpoint provided an id that is the wrong data type", () => {
    return request(app)
      .get("/api/articles/shouldthrowbadrequest/comments")
      .expect(400)
      .then((res) => {
        const body = res.body;
        expect(body).toEqual({ message: "Bad Request" });
      });
  });
});

describe("5. POST /api/articles/:article_id/comments", () => {
  it("201: Should respond with the created row", () => {
    const requestBody = {
      username: "butter_bridge",
      body: "I buttered a butter bridge",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(requestBody)
      .expect(201)
      .then((res) => {
        const postedComment = res.body.comment;
        expect(postedComment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            body: expect.any(String),
            article_id: expect.any(Number),
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
          })
        );
      });
  });
  it("201: Should ignore unecessary properties in requestBody that are not username or body", () => {
    const requestBody = {
      username: "butter_bridge",
      body: "I buttered a butter bridge",
      uncessary: "ignore me",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(requestBody)
      .expect(201)
      .then((res) => {
        const postedComment = res.body.comment;
        expect(postedComment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            body: expect.any(String),
            article_id: expect.any(Number),
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
          })
        );
      });
  });

  describe("Errors", () => {
    describe("ID Errors", () => {
      it("404: Should return a Not Found message when endpoint at the given ID does not exist", () => {
        const requestBody = {
          username: "butter_bridge",
          body: "I buttered a butter bridge",
        };
        return request(app)
          .post("/api/articles/99999/comments")
          .send(requestBody)
          .expect(404)
          .then((res) => {
            const body = res.body;
            expect(body).toEqual({ message: "Not Found" });
          });
      });

      it("400: Should return a Bad Request error when endpoint provided an ID that is the incorrect data type", () => {
        return request(app)
          .post("/api/articles/thisshouldcausea400errormessage/comments")
          .expect(400)
          .then((res) => {
            const body = res.body;
            expect(body).toEqual({ message: "Bad Request" });
          });
      });
    });

    it("400: Should respond with a Bad Request error message when sent a object with a malformed body", () => {
      const requestBody = {};
      return request(app)
        .post("/api/articles/2/comments")
        .send(requestBody)
        .expect(400)
        .then((res) => {
          const body = res.body;
          expect(body).toEqual({ message: "Bad Request" });
        });
    });

    it("400: Should respond with an appropriate error message when the user sends a comment object with an incorrect data type", () => {
      const requestBody = {
        username: "butter_bridge",
        body: { wad: 22 },
      };
      return request(app)
        .post("/api/articles/2/comments")
        .send(requestBody)
        .expect(400)
        .then((res) => {
          const body = res.body;
          expect(body).toEqual({ message: "Bad Request" });
        });
    });

    describe("Username Errors", () => {
      it("404: Should respond with a Not Found message when passed a username which is the correct data type but does not exist", () => {
        const requestBody = {
          username: "butter",
          body: "string",
        };
        return request(app)
          .post("/api/articles/2/comments")
          .send(requestBody)
          .expect(404)
          .then((res) => {
            const body = res.body;
            expect(body).toEqual({ message: "Not Found" });
          });
      });
    });
  });
});
