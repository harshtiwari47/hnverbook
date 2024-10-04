import jwt from 'jsonwebtoken';
import "dotenv/config.js";

import {
   Sequelize
} from 'sequelize';

import {
   User
} from '../models/user.js';
import {
   Posts,
   Share,
   Comment,
   Like
} from '../models/posts.js';
import {
   Blip
} from '../models/postType.js';

export async function getUserPosts(user, starts, ends) {
   try {
      const posts = await Posts.findAll({
         attributes: [
            'title',
            'createdAt',
            'type',
            'user_id',
            'post_id',
            // Subquery for like count
            [
               Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM likes
                  WHERE likes.post_id = Posts.post_id
                  )`), 'likeCount'
            ],
            // comment count
            [
               Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM comments
                  WHERE comments.post_id = Posts.post_id
                  )`), 'commentCount'
            ],
            // share count
            [
               Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM shares
                  WHERE shares.post_id = Posts.post_id
                  )`), 'shareCount'
            ],
            // Subquery for isLiked
            [
               Sequelize.literal(`(
                  EXISTS(
                  SELECT 1
                  FROM likes
                  WHERE likes.user_id = '${user}' AND likes.post_id = Posts.post_id
                  )
                  )`), 'isLiked'
            ],
            // Subquery for isSaved
            [
               Sequelize.literal(`(
                  EXISTS(
                  SELECT 1
                  FROM saves
                  WHERE saves.user_id = '${user}' AND saves.post_id = Posts.post_id
                  )
                  )`), 'isSaved'
            ]
         ],
         include: [{
            model: Blip,
            attributes: ['description'],
            required: false,
            where: {
               [Sequelize.Op.and]: [{
                  user_id: user
               },
                  Sequelize.literal("posts.type = 'blip'")
               ]
            }
         }],
         where: {
            user_id: user
         },
         offset: starts,
         limit: ends,
         order: [['createdAt', 'DESC']]
      });

      const result = posts.map(post => ({
         title: post.title,
         postId: post.dataValues.post_id,
         description: post.blip ? post.blip.description: null,
         user: post.user_id ? post.user_id: null,
         datePublished: post.createdAt,
         postType: post.type,
         likeCount: post.dataValues.likeCount ? post.dataValues.likeCount: 0,
         commentCount: post.dataValues.commentCount ? post.dataValues.commentCount: 0,
         shareCount: post.dataValues.shareCount ? post.dataValues.shareCount: 0,
         isLiked: post.dataValues.isLiked ? post.dataValues.isLiked: 0,
         isSaved: post.dataValues.isSaved ? post.dataValues.isSaved: 0
      }));

      return result;

   } catch (error) {
      console.error('Error fetching posts:',
         error);
   }
}