import express from 'express';
var exploreRouter = express.Router();
import {
   authCheckLogin,
   authCheckSignUp,
   verifyUser
} from '../middlewares/authenticate.js';

import {
   User
} from '../models/user.js';

import {
   Op
} from 'sequelize';


exploreRouter.get('/', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light'; // Default to 'light'
   try {
      const user = await User.findByPk(req.user.id, {
         attributes: ['username', 'email', 'location', 'description', 'avatar', 'banner', 'link', 'joinedAt']
      });

      if (!user) return res.redirect('/auth/login')

      res.render('explore/explore', {
         title: 'Explore | HnverBook',
         theme,
         user
      });
   } catch (error) {
      res.status(500).render('error', {
         message: "Something went wrong", error: error.message
      });
   }
});

exploreRouter.get('/search', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light'; // Default to 'light'
   try {
      const user = await User.findByPk(req.user.id, {
         attributes: ['username', 'location']
      });

      if (!user) return res.redirect('/auth/login')

      res.render('explore/search', {
         title: 'Search | HnverBook',
         theme,
         user
      });
   } catch (error) {
      res.status(500).render('error', {
         message: "Something went wrong", error: error.message
      });
   }
});

exploreRouter.post('/search/user', verifyUser, async function(req, res, next) {

   const searchQuery = req.query.q;

   if (!searchQuery) {
      return res.json([]);
   }

   try {
      const users = await User.findAll({
         where: {
            [Op.or]: [{
               name: {
                  [Op.like]: `%${searchQuery}%`
               }
            },
               {
                  username: {
                     [Op.like]: `%${searchQuery}%`
                  }
               }]
         },
         attributes: ['username', 'location', 'name', 'verified', 'avatar'],
         limit: 10
      });

      // Send the found users back as JSON response
      res.json(users);
   } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({
         error: 'Something went wrong while searching.'
      });
   }
});

export default exploreRouter