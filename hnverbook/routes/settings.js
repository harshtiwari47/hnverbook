import express from 'express';
var settingsRouter = express.Router();
import {
   authCheckLogin,
   authCheckSignUp,
   verifyUser
} from '../middlewares/authenticate.js';

import {
   User
} from '../models/user.js';


settingsRouter.get('/', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light';
   try {
      const user = await User.findByPk(req.user.id, {
         attributes: ['username', 'email', 'location', 'description', 'avatar', 'banner', 'link', 'joinedAt']
      });

      if (!user) return res.redirect('/auth/login')

      res.render('settings/options', {
         title: 'Settings | HnverBook',
         theme,
         user
      });
   } catch (error) {
      res.status(500).render('error', {
         message: "Something went wrong", error: error.message
      });
   }
});

settingsRouter.get('/account', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light';
   try {
      const user = await User.findByPk(req.user.id, {
         attributes: ['username', 'email', 'description', 'avatar', 'link', 'name']
      });

      if (!user) return res.redirect('/auth/login')

      res.render('settings/account', {
         title: 'Update Profile | HnverBook',
         theme,
         user
      });
   } catch (error) {
      res.status(500).render('error', {
         message: "Something went wrong", error: error.message
      });
   }
});


export default settingsRouter