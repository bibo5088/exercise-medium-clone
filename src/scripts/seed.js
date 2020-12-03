import 'dotenv/config.js';
import faker from 'faker';
import {
  insertFakeArticle,
  insertFakeCategory,
  insertFakeTag,
  insertFakeUser,
  insertFakeComment,
} from '../../test/utils.js';
import knex from '../knex.js';

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('Seeding...');

  // user
  let promises = [];
  console.log('Seeding user...');
  for (let i = 0; i < 10; i++) {
    promises.push(insertFakeUser());
  }
  const userIds = (await Promise.all(promises)).map((u) => u.id);
  console.log('Seeding user done!');

  // category
  promises = [];
  console.log('Seeding category...');
  for (let i = 0; i < 3; i++) {
    promises.push(insertFakeCategory());
  }
  const categoryIds = (await Promise.all(promises)).map((c) => c.id);
  console.log('Seeding category done!');

  // tag
  promises = [];
  console.log('Seeding tag...');
  for (let i = 0; i < 7; i++) {
    promises.push(insertFakeTag());
  }
  const tagIds = (await Promise.all(promises)).map((c) => c.id);
  console.log('Seeding tag done!');

  // article
  promises = [];
  console.log('Seeding article...');
  for (let i = 0; i < 20; i++) {
    promises.push(
      insertFakeArticle(
        faker.helpers.shuffle(userIds)[0],
        faker.helpers.shuffle(categoryIds)[0]
      )
    );
  }
  const articleIds = (await Promise.all(promises)).map((a) => a.id);
  console.log('Seeding article done!');

  // article_tag
  promises = [];
  console.log('Seeding article_tag...');
  for (const articleId of articleIds) {
    const tagCount = randomInteger(0, 4);
    const tagIdsSuffled = faker.helpers.shuffle(tagIds);
    for (let i = 0; i < tagCount; i++) {
      promises.push(
        knex('article_tag').insert({
          tag_id: tagIdsSuffled[i],
          article_id: articleId,
        })
      );
    }
  }
  await Promise.all(promises);
  console.log('Seeding article_tag done!');

  // comment
  promises = [];
  console.log('Seeding comment...');
  for (const articleId of articleIds) {
    const commentCount = randomInteger(0, 5);
    for (let i = 0; i < commentCount; i++) {
      promises.push(
        insertFakeComment(faker.helpers.shuffle(userIds)[0], articleId)
      );
    }
  }
  await Promise.all(promises);
  console.log('Seeding comment done!');

  // to_read
  promises = [];
  console.log('Seeding to_read...');
  for (const articleId of articleIds) {
    const count = randomInteger(0, 7);
    const userIdsShuffled = faker.helpers.shuffle(userIds);
    for (let i = 0; i < count; i++) {
      promises.push(
        knex('to_read').insert({
          user_id: userIdsShuffled[i],
          article_id: articleId,
        })
      );
    }
  }
  await Promise.all(promises);
  console.log('Seeding to_read done!');

  // liked
  promises = [];
  console.log('Seeding liked...');
  for (const articleId of articleIds) {
    const count = randomInteger(0, 7);
    const userIdsShuffled = faker.helpers.shuffle(userIds);
    for (let i = 0; i < count; i++) {
      promises.push(
        knex('liked').insert({
          user_id: userIdsShuffled[i],
          article_id: articleId,
        })
      );
    }
  }
  await Promise.all(promises);
  console.log('Seeding liked done!');

  // user_follow
  promises = [];
  console.log('Seeding user_follow...');
  const userIdsShuffled = faker.helpers.shuffle(userIds);
  for (let i = 0; i < userIdsShuffled.length; i += 2) {
    promises.push(
      knex('user_follow').insert({
        follower_id: userIdsShuffled[i],
        followee_id: userIdsShuffled[i + 1],
      })
    );
  }

  await Promise.all(promises);
  console.log('Seeding user_follow done!');

  console.log('Seeding done!');
  process.exit(0);
}
main();
