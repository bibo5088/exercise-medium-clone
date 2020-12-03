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

  const rawArticle = await knex({ a: 'article' })
    .leftJoin({ u: 'user' }, 'a.author_id', '=', 'u.id')
    .leftJoin({ c: 'category' }, 'a.category_id', '=', 'c.id')
    .leftJoin({ t: 'tag' }, (join) => {
      join.onIn(
        't.id',
        knex('article_tag')
          .select('article_tag.tag_id')
          .where('article_tag.article_id', '=', knex.raw('a.id'))
      );
    })
    .leftJoin({ co: 'comment' }, 'co.article_id', '=', 'a.id')
    .leftJoin({ co_u: 'user' }, 'co_u.id', '=', 'co.user_id')
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

      { tag_id: 't.id' },
      { tag_name: 't.name' },

      { comment_id: 'co.id' },
      { comment_content: 'co.content' },
      { comment_date: 'co.date' },

      { comment_user_id: 'co_u.id' },
      { comment_user_name: 'co_u.name' },
      { comment_user_avatar: 'co_u.avatar' },

      {
        like_count: knex('liked').count('*').where('article_id', '=', id),
      }
    );

  if (rawArticle == undefined) {
    return res.status(404).end();
  }

  const article = {
    id: rawArticle[0].id,
    name: rawArticle[0].name,
    content: rawArticle[0].content,
    thumbnail: rawArticle[0].thumbnail,
    date: rawArticle[0].date,
    likeCount: rawArticle[0].like_count,
    author: {
      id: rawArticle[0].user_id,
      name: rawArticle[0].user_name,
      avatar: rawArticle[0].user_avatar,
    },
    category: {
      id: rawArticle[0].category_id,
      name: rawArticle[0].category_name,
    },
    tags: {},
    comments: {},
  };

  for (const row of rawArticle) {
    if (row.tag_id != null) {
      article.tags[row.tag_id] = {
        id: row.tag_id,
        name: row.tag_name,
      };
    }

    if (row.comment_id != null) {
      article.comments[row.comment_id] = {
        id: row.comment_id,
        content: row.comment_content,
        date: row.comment_date,
        user: {
          id: row.comment_user_id,
          name: row.comment_user_name,
          avatar: row.comment_user_avatar,
        },
      };
    }
  }
  article.tags = Object.values(article.tags);
  article.comments = Object.values(article.comments);

  res.json(article);
});

export default router;
