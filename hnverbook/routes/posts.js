import express from 'express';
var postsRouter = express.Router();
import {
   authCheckLogin,
   authCheckSignUp,
   verifyUser
} from '../middlewares/authenticate.js';

import "dotenv/config.js";
import crypto from 'crypto';

import {
   User
} from '../models/user.js';
import {
   Posts
} from '../models/posts.js';
import {
   Blip
} from '../models/postType.js';

import {
   createBlipPost,
   likePost
} from '../controllers/post.controller.js';

import {
   decrypt,
   encrypt
} from '../utils/protection.js';

postsRouter.get('/create', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light';
   res.render('create', {
      title: 'Create',
      theme
   });
});

postsRouter.post('/submit/blip', verifyUser, createBlipPost);

postsRouter.post('/create/new', verifyUser, async function(req, res, next) {
   const {
      contentType, title, keywords 
   } = req.body;

   const encryptedTitleObj = encrypt(title.trim().substring(0, 100));
   const encryptedTitle = `${encryptedTitleObj.iv}:${encryptedTitleObj.encryptedData}`;

   if (contentType) {
      res.redirect(`/create/${contentType}/${encodeURIComponent(keywords)}/${encryptedTitle}`);
   } else {
      res.redirect('/create');
   }
});

postsRouter.get('/create/:contentType/:keywords/:title', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light';
   res.setHeader('Cache-Control', 'no-store');

   const {
      contentType,
      title,
      keywords
   } = req.params;

   const validContentTypes = ['blip',
      'media',
      'blog',
      'events',
      'interactive',
      'discussion',
      'storyboard'];
   if (!validContentTypes.includes(contentType)) {
      return res.redirect('/create');
   }

   const decryptedTitle = decrypt(title);

   const sanitizedTitle = decryptedTitle.substring(0, 100).trim();
   if (sanitizedTitle.length === 0) {
      return res.redirect('/create');
   }
   const keywordsList = decodeURIComponent(keywords).replace(/[^\w-,]+/g, '').toLowerCase();
   if (keywordsList.length > 200) {
      return res.redirect('/create');
   }

   res.render(`posts/${contentType}`, {
      title: `New ${contentType}`,
      keywordsList,
      postTitle: sanitizedTitle,
      theme,
      contentType
   });
});

postsRouter.post('/post/:postId/like', verifyUser, async function(req, res, next) {
   const {
      postId
   } = req.params;

   try {
      const result = await likePost(req, postId);

      if (result === 1) {
         return res.status(200).json({
            status: 'liked',
            statusCode: 200,
            message: 'Liked successfully'
         });
      } else if (result === 0) {
         return res.status(200).json({
            status: 'unliked',
            statusCode: 200,
            message: 'Unliked successfully'
         });
      } else {
         return res.status(404).json({
            status: 'fail',
            statusCode: 404,
            message: 'Invalid token. Please refresh the page.'
         });
      }
   } catch (e) {
      return res.status(500).json({
         status: 'fail',
         statusCode: 500,
         message: 'Like operation failed'
      });
   }
});

export default postsRouter