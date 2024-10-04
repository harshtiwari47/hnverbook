import "dotenv/config.js";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

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

import {
   decrypt,
   encrypt
} from '../utils/protection.js';

import {
   refreshAccessToken
} from '../controllers/user.controller.js';

const accessTokenSecret = process.env.ACCESS_TOKEN;
const refreshTokenSecret = process.env.REFRESH_TOKEN;

export const createBlipPost = async (req, res) => {
   const token = req.cookies.accessToken;
   try {
      const {
         title,
         description
      } = req.body;

      let sanitizedTitle;
      let decryptedTitle;

      try {
         decryptedTitle = decrypt(title);
         sanitizedTitle = decryptedTitle.substring(0, 100).trim();
      } catch (e) {
         res.status(400).json({
            status: 'fail',
            statusCode: 400,
            message: 'Invalid call! Try again or re-create a post.'
         });
      }

      if (sanitizedTitle.length >= 100) {
         return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            message: 'Title should not be longer than 100 characters.'
         });
      }

      if (description.trim().length >= 251) {
         return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            message: 'Description should not be longer than 250 characters.'
         });
      }

      jwt.verify(token,
         accessTokenSecret,
         async (err, user) => {
            if (err) {
               return res.status(401).json({
                  status: 'fail',
                  statusCode: 401,
                  message: 'Invalid or expired token. Please try to refresh or login in again.'
               });
            }

            try {

               const newPost = await Posts.create({
                  userId: user.id, type: "blip", title: sanitizedTitle
               });
               const blipPost = await Blip.create({
                  userId: user.id, postId: newPost.postId, description: description
               });

               return res.status(201).json({
                  status: 'success',
                  statusCode: 201,
                  message: "New blip created successfully!"
               });

            } catch (dbError) {
               console.error(dbError); // Log the error for debugging
               return res.status(500).json({
                  status: 'error',
                  statusCode: 500,
                  message: 'Error creating the blip post. Please try again later.'
               });
            }
         });

   } catch (error) {
      console.log(error);
      return res.status(500).json({
         status: 'error',
         statusCode: 500,
         message: 'Something went wrong while creating the blip.'
      });
   }
}

export const likePost = async (req, postId) => {
   const token = req.cookies.accessToken;

   if (!token) {
      return refreshAccessToken(req, res);
   }

   try {
      const user = await new Promise((resolve, reject) => {
         jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
               reject(err);
            } else {
               resolve(user);
            }
         });
      });

      const likes = await Like.findAll({
         attributes: ['like_id'],
         where: {
            post_id: postId,
            user_id: user.id
         }
      });

      if (likes.length === 0) {
         // Like the post if no likes found
         const likePost = await Like.create({
            userId: user.id,
            postId: postId
         });

         if (likePost) {
            return 1; // Success, liked the post
         }
      } else {
         // Unlike the post if a like is found
         const removeLike = await Like.destroy({
            where: {
               userId: user.id,
               postId: postId
            }
         });

         if (removeLike) {
            return 0; // Success, unliked the post
         }
      }
   } catch (error) {
      // If the token is invalid, attempt to refresh it
      return 2;
   }
}