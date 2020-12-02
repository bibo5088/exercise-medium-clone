import { Router } from 'express';
import knex from '../knex.js';
const router = Router();

router.get('/', async (req, res) => {
  const articlesRaw = await knex('article AS a')
    .join('user AS u', 'a.author_id', '=', 'u.id')
    .join('category AS c', 'a.category_id', '=', 'c.id')
    .select(
      'a.id',
      'a.name',
      'a.content',
      'a.thumbnail',
      'a.date',

      'u.id AS user_id',
      'u.name AS user_name',
      'u.avatar AS user_avatar',

      'c.id AS category_id',
      'c.name AS category_name'
    );
  const articles = articlesRaw.map((r) => ({
    id: r.id,
    name: r.name,
    content: r.content,
    thumbnail: r.thumbnail,
    date: r.date,
    user: {
      id: r.user_id,
      name: r.user_name,
      avatar: r.user_avatar,
    },
    category: {
      id: r.category_id,
      name: r.category_name,
    },
  }));

  res.json(articles);
});

export default router;
