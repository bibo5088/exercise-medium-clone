import { Router } from 'express';
import knex from '../knex.js';
const router = Router();

router.get('/', async (req, res) => {
  const articlesRaw = await knex({ a: 'article' })
    .join({ u: 'user' }, 'a.author_id', '=', 'u.id')
    .join({ c: 'category' }, 'a.category_id', '=', 'c.id')
    .select(
      'a.id',
      'a.name',
      'a.content',
      'a.thumbnail',
      'a.date',

      { user_id: 'u.id' },
      { user_name: 'u.name' },
      { user_avatar: 'u.avatar' },

      { category_id: 'c.id' },
      { category_name: 'c.name' }
    );
  const articles = articlesRaw.map((r) => ({
    id: r.id,
    name: r.name,
    content: r.content,
    thumbnail: r.thumbnail,
    date: r.date,
    author: {
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

router.get('/:id(\\d+)', async (req, res) => {
  const id = Number(req.params.id);

  const articleQuery = knex({ a: 'article' })
    .leftJoin({ u: 'user' }, 'a.author_id', '=', 'u.id')
    .leftJoin({ c: 'category' }, 'a.category_id', '=', 'c.id')
    .where('a.id', '=', id)
    .select(
      'a.id',
      'a.name',
      'a.content',
      'a.thumbnail',
      'a.date',

      { user_id: 'u.id' },
      { user_name: 'u.name' },
      { user_avatar: 'u.avatar' },

      { category_id: 'c.id' },
      { category_name: 'c.name' },

      {
        like_count: knex('liked').count('*').where('article_id', '=', id),
      }
    )
    .first();
  const tagsQuery = knex('tag').whereIn(
    'id',
    knex('article_tag')
      .select('article_tag.tag_id')
      .where('article_tag.article_id', '=', id)
  );
  const commentsQuery = knex({ c: 'comment' })
    .where('c.article_id', '=', id)
    .leftJoin({ u: 'user' }, 'u.id', '=', 'c.user_id')
    .select(
      'c.id',
      'c.content',
      'c.date',

      { user_id: 'u.id' },
      { user_name: 'u.name' },
      { user_avatar: 'u.avatar' }
    );

  const [rawArticle, rawTags, rawComments] = await Promise.all([
    articleQuery,
    tagsQuery,
    commentsQuery,
  ]);

  if (rawArticle == undefined) {
    return res.status(404).end();
  }

  const article = {
    id: rawArticle.id,
    name: rawArticle.name,
    content: rawArticle.content,
    thumbnail: rawArticle.thumbnail,
    date: rawArticle.date,
    likeCount: rawArticle.like_count,
    author: {
      id: rawArticle.user_id,
      name: rawArticle.user_name,
      avatar: rawArticle.user_avatar,
    },
    category: {
      id: rawArticle.category_id,
      name: rawArticle.category_name,
    },
    tags: rawTags.map((t) => ({
      id: t.id,
      name: t.name,
    })),
    comments: rawComments.map((c) => ({
      id: c.id,
      content: c.content,
      date: c.date,
      user: {
        id: c.user_id,
        name: c.user_name,
        avatar: c.user_avatar,
      },
    })),
  };

  res.json(article);
});

export default router;
