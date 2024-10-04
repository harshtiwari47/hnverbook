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
                  message: 'An error occurred while updating space. Please try again.'
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
         message: 'Something went wrong while creating the space.'
      });
   }
}