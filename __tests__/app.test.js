const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const articles = require("../db/data/test-data/articles");

afterAll(() => {
  if (db.end) db.end();
});

beforeEach(() => seed(data));

describe("1. GET /api/topics", () => {
  test("200: should respond with an array of topic objects", () => {
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
  test("200: should respond with an array of article objects", () => {
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
  it("200: should return articles sorted by date descending order by default", () => {
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
