import 'dotenv/config.js';
import app from '../src/app.js';
import supertest from 'supertest';
import knex from '../src/knex.js';
import {
  insertFakeArticle,
  insertFakeCategory,
  insertFakeComment,
  insertFakeTag,
  insertFakeUser,
} from './utils.js';

jest.setTimeout(30000);
describe('/api/articles', () => {
  let user;
  let category1;
  let category2;
  let article1;
  let article2;
  let comment1;
  let comment2;
  let tag1;
  let tag2;
  beforeEach(async () => {
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
    await knex('article').truncate();
    await knex('category').truncate();
    await knex('user').truncate();
    await knex('comment').truncate();
    await knex('article_tag').truncate();
    await knex('tag').truncate();
    await knex('liked').truncate();
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

    user = await insertFakeUser();

    category1 = await insertFakeCategory();
    category2 = await insertFakeCategory();

    article1 = await insertFakeArticle(user.id, category1.id);
    article2 = await insertFakeArticle(user.id, category2.id);

    comment1 = await insertFakeComment(user.id, article1.id);
    comment2 = await insertFakeComment(user.id, article1.id);
    tag1 = await insertFakeTag();
    tag2 = await insertFakeTag();

    await knex('article_tag').insert({
      tag_id: tag1.id,
      article_id: article1.id,
    });
    await knex('article_tag').insert({
      tag_id: tag2.id,
      article_id: article1.id,
    });

    await knex('liked').insert({
      user_id: user.id,
      article_id: article1.id,
    });
  });

  afterAll(() => {
    knex.destroy();
    app.close();
  });

  it('GET / - Should return all the articles', async () => {
    const res = await supertest(app)
      .get('/api/articles')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toEqual([
      {
        id: article1.id,
        name: article1.name,
        content: article1.content,
        thumbnail: article1.thumbnail,
        date: article1.date.toISOString(),
        author: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        },
        category: {
          id: category1.id,
          name: category1.name,
        },
      },
      {
        id: article2.id,
        name: article2.name,
        content: article2.content,
        thumbnail: article2.thumbnail,
        date: article2.date.toISOString(),
        author: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        },
        category: {
          id: category2.id,
          name: category2.name,
        },
      },
    ]);
  });

  it('GET /:id - Should return the matching article with tags and comments', async () => {
    const res = await supertest(app)
      .get(`/api/articles/${article1.id}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toEqual({
      id: article1.id,
      name: article1.name,
      content: article1.content,
      thumbnail: article1.thumbnail,
      date: article1.date.toISOString(),
      likeCount: 1,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      category: {
        id: category1.id,
        name: category1.name,
      },
      tags: [
        {
          id: tag1.id,
          name: tag1.name,
        },
        {
          id: tag2.id,
          name: tag2.name,
        },
      ],
      comments: [
        {
          id: comment1.id,
          content: comment1.content,
          date: comment1.date.toISOString(),
          user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
          },
        },
        {
          id: comment2.id,
          content: comment2.content,
          date: comment2.date.toISOString(),
          user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
          },
        },
      ],
    });
  });

  it('GET /:id - Should return the matching article with no tags and no comments', async () => {
    const res = await supertest(app)
      .get(`/api/articles/${article2.id}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toEqual({
      id: article2.id,
      name: article2.name,
      content: article2.content,
      thumbnail: article2.thumbnail,
      date: article2.date.toISOString(),
      likeCount: 0,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      category: {
        id: category2.id,
        name: category2.name,
      },
      tags: [],
      comments: [],
    });
  });

  it("GET /:id - Should return 404 if article id doesn't exist", async () => {
    await supertest(app).get(`/api/articles/404`).expect(404);
  });
});
