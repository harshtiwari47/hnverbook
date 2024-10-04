import express from 'express';
var indexRouter = express.Router();
import {
   authCheckLogin,
   authCheckSignUp,
   verifyUser
} from '../middlewares/authenticate.js';

import {
   Sequelize,
   Op
} from 'sequelize';

import {
   User
} from '../models/user.js';

import {
   Observer
} from '../models/observer.js';

import jwt from 'jsonwebtoken'

const accessTokenSecret = process.env.ACCESS_TOKEN;
const refreshTokenSecret = process.env.REFRESH_TOKEN;

indexRouter.get('/', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light'; // Default to 'light'
   
   try {
      const user = await User.findByPk(req.user.id, {
         attributes: ['username', 'email', 'location', 'description', 'avatar', 'banner', 'link', 'joinedAt']
      });

      if (!user) return res.redirect('/auth/login')

      res.render('index', {
         title: 'HnverBook | Home',
         theme,
         user
      });
   } catch (error) {
      res.status(500).render('error', {
         message: "Something went wrong", error: error.message
      });
   }
});


indexRouter.get('/profile/:username', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light';
   try {
      const {
         username
      } = req.params;

      const userData = await User.findOne({
         where: {
            username
         },
         attributes: ['user_id', 'name', 'username', 'email', 'description', 'avatar', 'banner', 'link', 'verified']
      });


      let connection = {
         observerCount: 0,
         observingCount: 0
      };

      let isObserving = false;

      if (userData) {
         if (req.user && req.user.id === userData.dataValues.user_id) return res.redirect('/account');

         const observerData = await Observer.findAll({
            attributes: [
               [Sequelize.fn('COUNT', Sequelize.col('observer_id')), 'observerCount'], // Count of users observing this user
            ],
            where: {
               observer_id: userData.dataValues.user_id
            },
            raw: true
         });
         const observingData = await Observer.findAll({
            attributes: [
               [Sequelize.fn('COUNT', Sequelize.col('observing_id')), 'observingCount'], // Count of users this user observing
            ],
            where: {
               observing_id: userData.dataValues.user_id
            },
            raw: true
         });

         connection = {
            observerCount: observerData[0].observerCount,
            observingCount: observingData[0].observingCount
         }

         let currentUserObserving = await Observer.findOne({
            where: {
               observer_id: userData.dataValues.user_id,
               observing_id: req.user.id
            }
         });

         if (currentUserObserving !== null) {
            isObserving = true;
         }

         connection.observing = isObserving;
      }

      if (!userData) return res.status(404).render('404', {
         message: "User not found!",
         theme
      });

      const docs = [];

      res.render('account/profile', {
         title: `${userData.name}'s Profile`,
         theme,
         docs,
         userData,
         connection,
         profileOwner: false
      });
   } catch (error) {
      console.log(error)
      res.status(500).render('error', {
         message: "Something went wrong", error: error.message,
      });
   }
});
indexRouter.post('/observeState/:username', async function(req, res, next) {
   const token = req.cookies.accessToken;

   if (!token) {
      return res.status(401).json({
         status: 'fail',
         message: 'Invalid or expired token. Please try to refresh or login in again.'
      });
   }

   try {
      const {
         username
      } = req.params;

      jwt.verify(token,
         accessTokenSecret,
         async (err, user) => {
            if (err) {
               return res.status(401).json({
                  status: 'fail',
                  message: 'Invalid or expired token. Please try to refresh or login in again.'
               });
            }

            const userData = await User.findOne({
               where: {
                  username
               },
               attributes: ['user_id']
            });

            if (!userData) {
               return res.status(404).json({
                  status: 'fail',
                  statusCode: 404,
                  message: 'Target user is not found.'
               });
            }

            // checking observing state
            let currentObservingState = await Observer.findOne({
               where: {
                  observer_id: userData.dataValues.user_id,
                  observing_id: user.id
               }
            });

            if (currentObservingState === null) {
               await Observer.create({
                  observingId: user.id, observerId: userData.dataValues.user_id
               });
               return res.status(201).json({
                  status: 'observe',
                  statusCode: 201,
                  message: "Observe status updated successfully!"
               });
            } else {
               await currentObservingState.destroy();
               return res.status(201).json({
                  status: 'ignore',
                  statusCode: 201,
                  message: "Observe status updated successfully!"
               });
            }
         });

   } catch (error) {
      console.log(error);
      return res.status(500).json({
         status: 'error',
         statusCode: 500,
         message: 'Please try again later.'
      });
   }
});

indexRouter.get('/set-theme/:theme',
   (req, res) => {
      const theme = req.params.theme;
      res.cookie('theme',
         theme,
         {
            maxAge: 900000,
            httpOnly: true
         });
      res.redirect('/');
   });

export default indexRouter