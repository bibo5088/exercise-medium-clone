import 'dotenv/config.js';
import knex from '../knex.js';

async function main() {
  console.log('Creating tables...');
  await knex.schema
    .createTable('user', (table) => {
      table.increments();
      table.string('name').notNullable();
      table.string('avatar').notNullable();
    })
    .createTable('category', (table) => {
      table.increments();
      table.string('name').notNullable();
    })
    .createTable('article', (table) => {
      table.increments();
      table.string('name').notNullable();
      table.string('slug').notNullable();
      table.string('thumbnail');
      table.text('content', 'MEDIUMTEXT').notNullable();
      table
        .dateTime('date')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'));

      table.integer('author_id').unsigned().notNullable();
      table.foreign('author_id').references('user.id');

      table.integer('category_id').unsigned().notNullable();
      table.foreign('category_id').references('category.id');
    })
    .createTable('tag', (table) => {
      table.increments();
      table.string('name').notNullable();
    })
    .createTable('comment', (table) => {
      table.increments();
      table.text('content', 'TEXT').notNullable();
      table
        .dateTime('date')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'));

      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('user.id');

      table.integer('article_id').unsigned().notNullable();
      table.foreign('article_id').references('article.id');
    })
    // Pivot Tables
    .createTable('article_tag', (table) => {
      table.integer('tag_id').unsigned().notNullable();
      table.foreign('tag_id').references('tag.id');

      table.integer('article_id').unsigned().notNullable();
      table.foreign('article_id').references('article.id');
    })
    .createTable('user_follow', (table) => {
      table.integer('follower_id').unsigned().notNullable();
      table.foreign('follower_id').references('user.id');

      table.integer('followee_id').unsigned().notNullable();
      table.foreign('followee_id').references('user.id');
    })
    .createTable('liked', (table) => {
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('user.id');

      table.integer('article_id').unsigned().notNullable();
      table.foreign('article_id').references('article.id');
    })
    .createTable('to_read', (table) => {
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('user.id');

      table.integer('article_id').unsigned().notNullable();
      table.foreign('article_id').references('article.id');
    });

  console.log('Tables created!');
  process.exit(0);
}
main();

process.on('unhandledRejection', (e) => {
  console.error(e);
  process.exit(1);
});
