import express from 'express';
var accountRouter = express.Router();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import "dotenv/config.js";
import {
   registerUser,
   loginUser,
   refreshAccessToken,
   verifyEmail
} from '../../controllers/user.controller.js';
import {
   sendVerificationEmail
} from '../../utils/resetPasswordEmail.js';

import {
   Sequelize,
   Op
} from 'sequelize';
import {
   getUserPosts
} from '../../controllers/orderPosts.controller.js';

import {
   verifyUser
} from '../../middlewares/authenticate.js';

import {
   User
} from '../../models/user.js';
import {
   Posts
} from '../../models/posts.js';
import {
   Blip
} from '../../models/postType.js';
import {
   Observer
} from '../../models/observer.js';

const accessTokenSecret = process.env.ACCESS_TOKEN;
const refreshTokenSecret = process.env.REFRESH_TOKEN;
const resetPassTokenSecret = process.env.RESET_PASS_TOKEN
accountRouter.get('/', function(req, res, next) {
   try {
      const token = req.cookies.accessToken;

      if (!token) {
         return refreshAccessToken(req, res, next);
      }

      jwt.verify(token, accessTokenSecret, async (err, user) => {
         if (err) {
            return refreshAccessToken(req, res, next);
         }

         const userData = await User.findByPk(user.id, {
            attributes: ['name', 'username', 'email', 'description', 'avatar', 'banner', 'link', 'verified']
         });

         const observerData = await Observer.findAll({
            attributes: [
               [Sequelize.fn('COUNT', Sequelize.col('observer_id')), 'observerCount'], // Count of users observing this user
            ],
            where: {
               observer_id: user.id
            },
            raw: true
         });
         const observingData = await Observer.findAll({
            attributes: [
               [Sequelize.fn('COUNT', Sequelize.col('observing_id')), 'observingCount'], // Count of users this user observing
            ],
            where: {
               observing_id: user.id
            },
            raw: true
         });

         const connection = {
            observerCount: observerData[0].observerCount,
            observingCount: observingData[0].observingCount
         }

         getUserPosts(user.id, 0, 10).then(result => {
            let userPosts = result;
            let docs = ``;
            const theme = req.cookies.theme || 'light';

            if (userPosts.length > 0) {
               userPosts.forEach((value, index) => {

                  let likeImg;
                  if (value.isLiked === 1) {
                     likeImg = `<img src="/icon/stroke/Thumbs Up/${theme === 'light' ? 'ea1919': 'c26666'}/40/3" width="25" height="25">`
                  } else {
                     likeImg = `<img src="/icon/stroke/Thumbs Up/${theme === 'light' ? '171b20': 'dbe1e8'}/40/1.5" width="25" height="25">`
                  }

                  let date = new Date(value.datePublished);
                  docs += `<div class="post blip" data-id="${value.postId}">
                  <p class="post-blip-date">${date.getDay()}/${date.getMonth()}/${date.getFullYear()}</p>
                  <h2 class="post-blip-title">${value.title}</h2>
                  <p class="post-blip-description">${value.description}</p>
                  <div class="postAction">
                  <ul>
                  <li id="like${value.postId}" onclick="likePost('${value.postId}', '${theme}')" class="like">${likeImg}<span class="count">${value.likeCount}</span></li>
                  <li id="comment${value.postId}" onclick="commentPost('${value.postId}', '${theme}')" class="comment"><img src="/icon/stroke/Message Round/${theme === 'light' ? '171b20': 'dbe1e8'}/40/1.5" width="25" height="25"><span class="count">${value.shareCount}</span></li>
                  <li id="share${value.postId}" onclick="sharePost('${value.postId}', '${theme}')" class="share"><img src="/icon/stroke/Share/${theme === 'light' ? '171b20': 'dbe1e8'}/40/1.5" width="25" height="25"><span class="count">${value.commentCount}</span></li>
                  <li id="save${value.postId}" onclick="savePost('${value.postId}', '${theme}')" class="save"><img src="/icon/stroke/Bookmark/${theme === 'light' ? '171b20': 'dbe1e8'}/40/1.5" width="25" height="25"></li>
                  </ul>
                  </div>
                  </div>`;
               })
            } else {
               docs = `<p class="info-no-post">
               Oops! User doesn't have any post.
               </p>`;
            }

            res.render('account/profile',
               {
                  title: "Profile | HnverBook",
                  theme,
                  docs,
                  userData,
                  connection,
                  profileOwner: true
               });

         }).catch(err => {

            const theme = req.cookies.theme || 'light';

            let docs = `<p class="info-no-post">
            Oops! User doesn't have any post.
            </p>`;

            res.render('account/profile',
               {
                  title: "Profile | HnverBook",
                  theme,
                  docs,
                  observerData,
                  userData
               });

            console.log(err)
         });

      });
   } catch (error) {
      res.status(500).render('error', {
         message: "Something went wrong", error: error.message
      });
   }
});

accountRouter.get('/verify', function(req, res, next) {
   const token = req.cookies.accessToken;

   if (!token) {
      return refreshAccessToken(req, res, next);
   }

   jwt.verify(token, accessTokenSecret, async (err, user) => {
      if (err) {
         return refreshAccessToken(req, res, next);
      }

      const userData = await User.findByPk(user.id, {
         attributes: ['authVerified']
      });

      if (userData && userData.authVerified) {
         return res.redirect('/');
      } else if (userData) {
         res.setHeader('Cache-Control', 'no-store');
         const theme = req.cookies.theme || 'light';
         res.render('account/verify',
            {
               title: "Email Verification | HnverBook",
               theme
            });
      } else {
         res.clearCookie('accessToken');
         res.clearCookie('refreshToken');
         return res.redirect('/auth/login');
      }
   });
});

accountRouter.get('/reset-password', function(req, res, next) {
   const theme = req.cookies.theme || 'light';
   
      res.render('account/reset-password',
         {
            title: "Reset Password | HnverBook",
            theme,
            message: null,
            continueReset: false
         });
});

accountRouter.post('/reset-password/verify', async function(req, res, next) {
   const {
      email
   } = req.body;
   try {
      const user = await User.findOne({
         attributes: ['user_id'],
         where: {
            email
         }
      });

      if (user) {
         let token = req.cookies.resetPassToken;

         if (!token) {
            token = await jwt.sign({
               id: user.dataValues.user_id
            }, resetPassTokenSecret, {
               expiresIn: '30m'
            });

            res.cookie('resetPassToken', token, {
               httpOnly: true, // Prevents JavaScript from accessing the token
               maxAge: 30 * 60 * 1000, // 30 minutes
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'Strict'
            });
         }

         await sendVerificationEmail(email, token, res);
         return res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: "An email containing a verification link has been sent to your inbox. Please check your email to complete the verification process."
         });
      } else {
         return res.status(404).json({
            status: 'error',
            statusCode: 404,
            message: "User Not Found!"
         });
      }
   } catch (error) {
      return res.status(404).json({
         status: 'error',
         statusCode: 404,
         message: error.message
      });
   }
});

accountRouter.post('/reset-password/confirm', async function(req, res, next) {
   const {
      password
   } = req.body;
   try {

      let token = req.cookies.resetPassToken;

      if (!token) {
         return res.status(404).json({
            status: 'fail',
            statusCode: 404,
            message: "Timeout. Request a new reset email."
         });
      }

      jwt.verify(token, resetPassTokenSecret, async (err, user) => {
         if (err) {
            return res.status(404).json({
               status: 'fail',
               statusCode: 404,
               message: "Invalid token. Please try to request new link."
            });
         }

         const userData = await User.findOne({
            where: {
               user_id: user.id
            }
         });

         if (userData) {

            if (!/^[0-9a-zA-Z!@#$%^&*()_+]+$/.test(password)) {
               return res.status(400).json({
                  status: 'fail',
                  statusCode: 400,
                  message: "Password can only contain letters (a-z, A-Z), numbers (0-9), and special characters (!@#$%^&*()_+)."
               });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            userData.password = hashedPassword;

            await userData.save();
            
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            
            return res.status(200).json({
               status: 'success',
               statusCode: 200,
               message: "Password Updated."
            });
         } else {
            return res.status(404).json({
               status: 'error',
               statusCode: 404,
               message: "User Not Found!"
            });
         }
      });
   } catch (error) {
      return res.status(404).json({
         status: 'error',
         statusCode: 404,
         message: error.message
      });
   }
});

export default accountRouter;