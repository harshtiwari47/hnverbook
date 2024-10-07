import express from 'express';
var notesRouter = express.Router();
import {
   authCheckLogin,
   authCheckSignUp,
   verifyUser,
   userDetail
} from '../../middlewares/authenticate.js';
import {
   createSpace,
   getUserSpaces,
   updateSpace,
   deleteSpace,
   getUserNotes,
   createNote,
   updateNote,
   deleteNote
} from '../../controllers/notes.controller.js';
import {
   User
} from '../../models/user.js';
import {
   Spaces,
   Notes
} from '../../models/notes.js';
import {
   formatDate
} from '../../utils/date.js';
import {
   parseCustomMarkdown
} from '../../utils/customMarkdown.js';
import {
   Op
} from 'sequelize';


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
               docs += `<div onclick="window.location.href='/notes/spaces/view/${value.spaceId}'" id="space${index}" style="--spaceColor: ${value.color}" class="spaces" data-id="${value.spaceId}">
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
            attributes: ['color',
               'title',
               'description']
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

notesRouter.get('/spaces/view/:spaceId', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light';
   const spaceId = req.params.spaceId;
   try {
      const space = await Spaces.findOne({
         where: {
            user_id: req.user.id,
            space_id: spaceId
         },
         attributes: ['title', 'user_id']
      });

      if (!space) return res.redirect('/notes');

      const spaceTitle = space.dataValues.title;
      getUserNotes(spaceId, 0, 10).then(result => {
         let docs = ``;
         if (result.length > 0) {

            result.forEach((value, index) => {
               docs += `<div onclick="window.location.href = '/notes/view/${spaceId}/${value.noteId}'" id="space${index}" class="spaces notes" style="--noteColor: ${value.textColor}" data-id="${value.spaceId}">
               <div data-color="${value.color}" class="info">
               <a href="/notes/edit/${value.spaceId}/${value.noteId}" title="edit space"><img src="/icon/stroke/Edit Pen/${theme === 'light' ? '171b20': 'dbe1e8' }/30/1.5" width="25" height="25" alt="edit" title="Edit"></a>
               <p class="notes-count">${formatDate(value.updated)}</p>
               </div>
               <h2 class="space-title">${value.title}</h2>
               <p class="space-description">${value.note.length > 100 ? value.note.substring(0, 100) + '...': value.note}</p>
               </div>`
            });

         } else {
            docs = `<p class="no-space-info"> Oops! you don't have any notes, try creating one by clicking the + icon.</p>`;
         }


         res.render('notes/notes', {
            title: `${space.dataValues.title} | HnverBook`,
            theme,
            spaceId,
            spaceTitle,
            docs
         });
      }).catch(e => {
         let docs = `<p class="no-space-info">Oops! Something went wrong while fetching your notes. If you don't have any, try creating one by clicking the + icon.</p>`;
         res.render('notes/notes', {
            title: `${space.dataValues.title} | HnverBook`,
            theme,
            spaceId,
            spaceTitle,
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

notesRouter.get('/edit/:spaceId/:noteId', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light';
   try {
      const {
         spaceId,
         noteId
      } = req.params;

      const space = await Spaces.findOne({
         where: {
            user_id: req.user.id,
            space_id: spaceId
         },
         attributes: ['title']
      });

      if (!space) return res.status(404).render('error', {
         message: "Something went wrong", error: error.message
      });

      const note = await Notes.findOne({
         where: {
            note_id: noteId
         },
         attributes: ['title', 'note', 'bgColor', 'textColor']
      });

      res.render('notes/createNote', {
         title: 'Edit Note | HnverBook',
         theme,
         space,
         note,
         edit: true
      });
   } catch (error) {
      res.status(500).render('error', {
         message: "Something went wrong", error: error.message
      });
   }
});

notesRouter.get('/view/:spaceId/:noteId', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light';
   try {
      const {
         spaceId,
         noteId
      } = req.params;

      const space = await Spaces.findOne({
         where: {
            user_id: req.user.id,
            space_id: spaceId
         },
         attributes: ['title']
      });

      if (!space) return res.status(404).render('error', {
         message: "Something went wrong", error: error.message
      });

      const note = await Notes.findOne({
         where: {
            note_id: noteId
         },
         attributes: ['title', 'note', 'bgColor', 'textColor', 'updatedAt']
      });

      note.dataValues.updatedAt = formatDate(note.dataValues.updatedAt);
      note.dataValues.note = parseCustomMarkdown(note.dataValues.note);

      res.render('notes/viewNote', {
         title: `${note.dataValues.title} | HnverBook`,
         theme,
         space,
         note
      });
   } catch (error) {
      res.status(500).render('error', {
         message: "Something went wrong", error: error.message
      });
   }
});

notesRouter.get('/create/:spaceId', verifyUser,
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

         res.render('notes/createNote', {
            title: 'New Note | HnverBook',
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

notesRouter.get('/search/:spaceId', verifyUser, async function(req, res, next) {
   const theme = req.cookies.theme || 'light'; // Default to 'light'
   try {
      const user = await User.findByPk(req.user.id, {
         attributes: ['username', 'location']
      });

      if (!user) return res.redirect('/auth/login');
      try {
      const {
         spaceId
      } = req.params;

      const space = await Spaces.findOne({
         where: {
            user_id: req.user.id,
            space_id: spaceId
         },
         attributes: ['title']
      });

      if (!space) return res.status(404).render('error', {
         message: "Something went wrong", error: error.message
      });
      
      res.render('explore/search', {
         title: 'Search | HnverBook',
         theme,
         user,
         space,
         type: 'notes'
      });
      
      } catch (e) {
         console.error(e);
         return res.status(404).render('error', {
         message: "Something went wrong", error: error.message
      });
      }

   } catch (error) {
      res.status(500).render('error', {
         message: "Something went wrong", error: error.message
      });
   }
});


notesRouter.post('/search/:spaceId', verifyUser, async function(req, res, next) {

   const searchQuery = req.query.q;
   const { spaceId } = req.params;
   
   if (!searchQuery) {
      return res.json([]);
   }

   try {
      const notes = await Notes.findAll({
         where: {
            spaceId,
            [Op.or]: [{
               title: {
                  [Op.like]: `%${searchQuery}%`
               }
            },
               {
                  note: {
                     [Op.like]: `%${searchQuery}%`
                  }
               }]
         },
         attributes: ['title', 'noteId', 'spaceId', 'updatedAt'],
         limit: 10
      });

      // Send the found notes back as JSON response
      res.json(notes);
   } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({
         error: 'Something went wrong while searching.'
      });
   }
});

notesRouter.post('/space/create/new', createSpace);
notesRouter.post('/space/delete/:spaceId', deleteSpace);
notesRouter.post('/space/update/:spaceId', updateSpace);

notesRouter.post('/create/:spaceId/new', userDetail, createNote);
notesRouter.post('/delete/:spaceId/:noteId', userDetail, deleteNote);
notesRouter.post('/update/:spaceId/:noteId', userDetail, updateNote);

export default notesRouter