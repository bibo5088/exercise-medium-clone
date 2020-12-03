import faker from 'faker';
import knex from '../src/knex.js';

async function insertFakeData(table, data) {
  const [id] = await knex(table).insert(data);

  return await knex(table).where('id', '=', id).first();
}

export async function insertFakeUser() {
  return await insertFakeData('user', {
    name: faker.name.findName(),
    avatar: faker.image.avatar(),
  });
}

export async function insertFakeCategory() {
  return await insertFakeData('category', {
    name: faker.lorem.word(),
  });
}

export async function insertFakeTag() {
  return await insertFakeData('tag', {
    name: faker.lorem.word(),
  });
}

export async function insertFakeArticle(authorId, categoryId) {
  const name = faker.lorem.sentence();

  return await insertFakeData('article', {
    name,
    slug: faker.helpers.slugify(name),
    thumbnail: faker.image.technics(),
    content: faker.lorem.paragraphs(3),
    date: faker.date.past(),
    author_id: authorId,
    category_id: categoryId,
  });
}

export async function insertFakeComment(userId, articleId) {
  return await insertFakeData('comment', {
    content: faker.lorem.sentences(2),
    date: faker.date.past(),
    user_id: userId,
    article_id: articleId,
  });
}
