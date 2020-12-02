import 'dotenv/config.js';
import app from '../src/app.js';
import supertest from 'supertest';
import knex from '../src/knex.js';
import {
  insertFakeArticle,
  insertFakeCategory,
  insertFakeUser,
} from './utils.js';

describe('/api/articles', () => {
  let user;
  let category1;
  let category2;
  let article1;
  let article2;
  beforeEach(async () => {
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
    await knex('article').truncate();
    await knex('category').truncate();
    await knex('user').truncate();
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

    user = await insertFakeUser();

    category1 = await insertFakeCategory();
    category2 = await insertFakeCategory();

    article1 = await insertFakeArticle(user.id, category1.id);
    article2 = await insertFakeArticle(user.id, category2.id);
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
        user: {
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
        user: {
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
});
