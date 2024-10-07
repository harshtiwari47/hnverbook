import "dotenv/config.js";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import {
   Sequelize
} from 'sequelize';

import {
   User
} from '../models/user.js';

import {
   Spaces,
   Notes
} from '../models/notes.js';

import {
   refreshAccessToken
} from '../controllers/user.controller.js';

const accessTokenSecret = process.env.ACCESS_TOKEN;
const refreshTokenSecret = process.env.REFRESH_TOKEN;


// space related
export const createSpace = async (req, res) => {
   const token = req.cookies.accessToken;

   try {
      const {
         color,
         title,
         description
      } = req.body;

      if (title.length >= 25) {
         return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            message: 'Title should not be longer than 100 characters.'
         });
      }

      if (description.trim().length >= 76) {
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
                  message: 'Invalid or expired token. Please try to refresh or login in again.'
               });
            }

            try {

               const newSpace = await Spaces.create({
                  userId: user.id, title, description, color
               });

               return res.status(201).json({
                  status: 'success',
                  statusCode: 201,
                  message: "New Space created successfully!"
               });

            } catch (dbError) {
               console.error(dbError); // Log the error for debugging
               return res.status(500).json({
                  status: 'error',
                  statusCode: 500,
                  message: 'Error creating the space. Please try again later.'
               });
            }
         });

   } catch (error) {
      console.log(error);
      return res.status(500).json({
         status: 'error',
         statusCode: 500,
         message: 'Something went wrong while creating the space.'
      });
   }
}

export const updateSpace = async (req, res) => {
   const token = req.cookies.accessToken;

   try {
      const {
         color,
         title,
         description
      } = req.body;

      const {
         spaceId
      } = req.params;

      if (title.length >= 25) {
         return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            message: 'Title should not be longer than 100 characters.'
         });
      }

      if (description.trim().length >= 76) {
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
                  message: 'Invalid or expired token. Please try to refresh or login in again.'
               });
            }

            const space = await Spaces.findOne({
               where: {
                  user_id: user.id,
                  space_id: spaceId
               }
            });

            if (!space) {
               return res.status(404).json({
                  status: 'fail',
                  statusCode: 404,
                  message: 'Space not found.'
               });
            }

            if (description) {
               space.description = description;
            }
            space.color = color;
            space.title = title;

            try {
               await space.save();
               return res.status(201).json({
                  status: 'success',
                  statusCode: 201,
                  message: "Space updated successfully!"
               });

            } catch (saveError) {
               if (saveError.name === 'SequelizeValidationError') {
                  // Handle specific Sequelize validation errors (like the URL validation)
                  return res.status(400).json({
                     status: 'fail',
                     statusCode: 400,
                     message: saveError.errors[0].message,
                     field: saveError.errors[0].path ? saveError.errors[0].path: null
                  });
               }
               // Catch other errors related to saving the user data
               return res.status(500).json({
                  status: 'error',
                  statusCode: 500,
                  message: 'An error occurred while updating space. Please try again.'
               });
            }
         });

   } catch (error) {
      console.log(error);
      return res.status(500).json({
         status: 'error',
         statusCode: 500,
         message: 'Something went wrong while updating the space.'
      });
   }
}

export const deleteSpace = async (req, res) => {
   const token = req.cookies.accessToken;

   try {
      const {
         spaceId
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

            const space = await Spaces.findOne({
               where: {
                  user_id: user.id,
                  space_id: spaceId
               }
            });

            if (!space) {
               return res.status(404).json({
                  status: 'fail',
                  statusCode: 404,
                  message: 'Space not found.'
               });
            }

            try {
               await space.destroy();
               return res.status(201).json({
                  status: 'success',
                  statusCode: 201,
                  message: "Space deleted successfully!"
               });

            } catch (saveError) {
               if (saveError.name === 'SequelizeValidationError') {
                  // Handle specific Sequelize validation errors (like the URL validation)
                  return res.status(400).json({
                     status: 'fail',
                     statusCode: 400,
                     message: saveError.errors[0].message,
                     field: saveError.errors[0].path ? saveError.errors[0].path: null
                  });
               }
               // Catch other errors related to saving the user data
               return res.status(500).json({
                  status: 'error',
                  statusCode: 500,
                  message: 'An error occurred while deleting space. Please try again.'
               });
            }
         });

   } catch (error) {
      console.log(error);
      return res.status(500).json({
         status: 'error',
         statusCode: 500,
         message: 'Something went wrong while deleting the space.'
      });
   }
}

export async function getUserSpaces(user, starts, ends) {
   try {
      const spaces = await Spaces.findAll({
         attributes: [
            'title',
            'createdAt',
            'color',
            'user_id',
            'space_id',
            'description',
            // Subquery for Notes count
            [
               Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM notes
                  WHERE notes.space_id = Spaces.space_id
                  )`),
               'notesCount'
            ]
         ],
         where: {
            user_id: user
         },
         offset: starts,
         limit: ends,
         order: [['createdAt',
            'DESC']]
      });

      const result = spaces.map(space => ({
         title: space.title,
         spaceId: space.dataValues.space_id,
         description: space.dataValues.description ? space.dataValues.description: null,
         user: space.user_id ? space.user_id: null,
         created: space.createdAt,
         color: space.color,
         notesCount: space.dataValues.notesCount ? space.dataValues.notesCount: 0
      }));

      return result;

   } catch (error) {
      console.error('Error fetching Spaces:',
         error);

      return res.status(500).json({
         status: 'error',
         statusCode: 500,
         message: 'Something went wrong while fetching the space.'
      });
   }
}


// notes related
export const createNote = async (req, res) => {
   const token = req.cookies.accessToken;
   const spaceId = req.params.spaceId;

   const space = await Spaces.findOne({
      where: {
         user_id: req.user.id,
         space_id: spaceId
      }
   });

   if (!space) return res.status(404).json({
      status: 'fail',
      statusCode: 404,
      message: 'Space not found.'
   });

   try {
      const {
         title,
         bgColor,
         textColor,
         note
      } = req.body;

      if (title.length >= 116) {
         return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            message: 'Title should not be longer than 100 characters.'
         });
      }

      jwt.verify(token,
         accessTokenSecret,
         async (err, user) => {
            if (err) {
               return res.status(401).json({
                  status: 'fail',
                  message: 'Invalid or expired token. Please try to refresh or login in again.'
               });
            }

            try {

               const newNote = await Notes.create({
                  userId: user.id, spaceId: spaceId, note, title, bgColor, textColor
               });

               return res.status(201).json({
                  status: 'success',
                  statusCode: 201,
                  message: "New note created successfully!"
               });

            } catch (dbError) {
               console.error(dbError); // Log the error for debugging
               return res.status(500).json({
                  status: 'error',
                  statusCode: 500,
                  message: 'Error creating the space. Please try again later.'
               });
            }
         });

   } catch (error) {
      console.log(error);
      return res.status(500).json({
         status: 'error',
         statusCode: 500,
         message: 'Something went wrong while creating the space.'
      });
   }
}

export const updateNote = async (req, res) => {
   const token = req.cookies.accessToken;

   const spaceId = req.params.spaceId;

   if (req.user && req.user.id === undefined) {
      return res.status(404).json({
         status: 'fail',
         statusCode: 404,
         message: 'User not found.'
      });
   }

   const space = await Spaces.findOne({
      where: {
         user_id: req.user.id,
         space_id: spaceId
      }
   });

   if (!space) return res.status(404).json({
      status: 'fail',
      statusCode: 404,
      message: 'Space not found.'
   });

   try {
      const {
         title,
         bgColor,
         textColor,
         note
      } = req.body;

      const {
         noteId
      } = req.params;

      if (title.length >= 115) {
         return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            message: 'Title should not be longer than 100 characters.'
         });
      }

      const noteData = await Notes.findOne({
         where: {
            user_id: req.user.id,
            note_id: noteId
         }
      });

      if (!noteData) {
         return res.status(404).json({
            status: 'fail',
            statusCode: 404,
            message: 'Note not found.'
         });
      }

      if (note) {
         noteData.note = note;
      }
      noteData.textColor = textColor;
      noteData.bgColor = bgColor;
      noteData.title = title;

      try {
         await noteData.save();
         return res.status(201).json({
            status: 'success',
            statusCode: 201,
            message: "Note updated successfully!"
         });

      } catch (saveError) {
         if (saveError.name === 'SequelizeValidationError') {
            // Handle specific Sequelize validation errors (like the URL validation)
            return res.status(400).json({
               status: 'fail',
               statusCode: 400,
               message: saveError.errors[0].message,
               field: saveError.errors[0].path ? saveError.errors[0].path: null
            });
         }
         // Catch other errors related to saving the user data
         return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while updating note. Please try again.'
         });
      }

   } catch (error) {
      console.log(error);
      return res.status(500).json({
         status: 'error',
         statusCode: 500,
         message: 'Something went wrong while updating the note.'
      });
   }
}

export const deleteNote = async (req, res) => {
   const token = req.cookies.accessToken;
   const {
      noteId,
      spaceId
   } = req.params;

   if (req.user && req.user.id === undefined) {
      return res.status(404).json({
         status: 'fail',
         statusCode: 404,
         message: 'User not found.'
      });
   }

   const space = await Spaces.findOne({
      where: {
         user_id: req.user.id,
         space_id: spaceId
      }
   });

   if (!space) return res.status(404).json({
      status: 'fail',
      statusCode: 404,
      message: 'Space not found.'
   });

   try {
      const note = await Notes.findOne({
         where: {
            user_id: req.user.id,
            note_id: noteId
         }
      });

      if (!note) {
         return res.status(404).json({
            status: 'fail',
            statusCode: 404,
            message: 'Note not found.'
         });
      }

      try {
         await note.destroy();
         return res.status(201).json({
            status: 'success',
            statusCode: 201,
            message: "Note deleted successfully!"
         });

      } catch (saveError) {
         if (saveError.name === 'SequelizeValidationError') {
            // Handle specific Sequelize validation errors (like the URL validation)
            return res.status(400).json({
               status: 'fail',
               statusCode: 400,
               message: saveError.errors[0].message,
               field: saveError.errors[0].path ? saveError.errors[0].path: null
            });
         }
         // Catch other errors related to saving the user data
         return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while deleting the note. Please try again.'
         });
      }

   } catch (error) {
      console.log(error);
      return res.status(500).json({
         status: 'error',
         statusCode: 500,
         message: 'Something went wrong while deleting the note.'
      });
   }
}

export async function getUserNotes(space, starts, ends) {
   try {
      const notes = await Notes.findAll({
         attributes: [
            'title',
            'createdAt',
            'updatedAt',
            'textColor',
            'bgColor',
            'user_id',
            'space_id',
            'note_id',
            'note'
         ],
         where: {
            space_id: space
         },
         offset: starts,
         limit: ends,
         order: [['createdAt',
            'DESC']]
      });

      const result = notes.map(note => ({
         title: note.title,
         spaceId: note.dataValues.space_id,
         noteId: note.dataValues.note_id,
         note: note.dataValues.note ? note.dataValues.note: null,
         user: note.user_id ? note.user_id: null,
         updated: note.updatedAt,
         textColor: note.textColor,
         bgColor: note.bgColor,
      }));

      return result;

   } catch (error) {
      console.error('Error fetching notes:',
         error);

      return res.status(500).json({
         status: 'error',
         statusCode: 500,
         message: 'Something went wrong while fetching the notes.'
      });
   }
}