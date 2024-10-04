import express from 'express';
var notesRouter = express.Router();
import {
   authCheckLogin,
   authCheckSignUp,
   verifyUser
} from '../middlewares/authenticate.js';

import {
   createSpace,
   getUserSpaces,
   updateSpace,
   deleteSpace
} from '../controllers/notes.controller.js';

import {
   User
} from '../models/user.js';

import {
   Spaces,
   Notes
} from '../models/notes.js';


notesRouter.get('/', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light';
   try {
      const user = await User.findByPk(req.user.id, {
         attributes: ['username', 'email', 'location', 'description', 'avatar', 'banner', 'link', 'joinedAt']
      });

      if (!user) return res.redirect('/auth/login');

      getUserSpaces(req.user.id, 0, 10).then(result => {
         let docs = ``;
         if (result.length > 0) {

            result.forEach((value, index) => {
               docs += `<div style="--spaceColor: ${value.color}" class="spaces" data-id="${value.spaceId}">
               <div data-color="${value.color}" class="info">
               <a href="/notes/spaces/edit/${value.spaceId}" title="edit space"><img src="/icon/stroke/Edit Pen/${theme === 'light' ? '171b20': 'dbe1e8' }/30/1.5" width="25" height="25" alt="edit" title="Edit"></a>
               <p class="notes-count">NOTES: ${value.notesCount}</p>
               </div>
               <h2 class="space-title">${value.title}</h2>
               <p class="space-description">${value.description}</p>
               </div>`
            });

         } else {
            docs = ` <p class="no-space-info"> Oops! you don't have any space, try creating one by clicking the + icon.</p>`;
         }

         res.render('notes/index', {
            title: 'Notes | HnverBook',
            theme,
            user,
            docs
         });
      }).catch(e => {
         let docs = `<p class="no-space-info">Oops! Something went wrong while fetching your spaces. If you don't have any, try creating one by clicking the + icon.</p>`;
         res.render('notes/index', {
            title: 'Notes | HnverBook',
            theme,
            user,
            docs
         });
      })

   } catch (error) {
      console.log(error)
      res.status(500).render('error',
         {
            message: "Something went wrong",
            error: error.message
         });
   }
});

notesRouter.get('/spaces/create',
   verifyUser,
   async function(req, res, next) {
      const theme = req.cookies.theme || 'light';
      try {
         const user = await User.findByPk(req.user.id,
            {
               attributes: ['username',
                  'email',
                  'location',
                  'description',
                  'avatar',
                  'banner',
                  'link',
                  'joinedAt']
            });

         if (!user) return res.redirect('/auth/login')

         res.render('notes/space', {
            title: 'New Space | HnverBook',
            theme,
            user,
            edit: false
         });
      } catch (error) {
         res.status(500).render('error', {
            message: "Something went wrong", error: error.message
         });
      }
   });

notesRouter.get('/spaces/edit/:spaceId', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light';
   try {
      const {
         spaceId
      } = req.params;

      const space = await Spaces.findByPk(spaceId,
         {
            attributes: ['color', 'title', 'description']
         });

      if (!space) return res.status(404).render('error', {
         message: "Something went wrong", error: error.message
      });

      res.render('notes/space', {
         title: 'Edit Space | HnverBook',
         theme,
         space,
         edit: true
      });
   } catch (error) {
      res.status(500).render('error', {
         message: "Something went wrong", error: error.message
      });
   }
});

notesRouter.post('/space/create/new', createSpace);

notesRouter.post('/space/delete/:spaceId', deleteSpace);

notesRouter.post('/space/update/:spaceId', updateSpace);

export default notesRouter