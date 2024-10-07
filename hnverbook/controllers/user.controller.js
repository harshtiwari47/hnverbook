import bcrypt from 'bcryptjs';
import {
   User
} from '../models/user.js';
import jwt from 'jsonwebtoken';
import "dotenv/config.js";
import {
   sendVerificationEmail
} from '../utils/sendEmailVerification.js';

import {
   APIError,
   handleError
} from '../utils/APIError.js';

const accessTokenSecret = process.env.ACCESS_TOKEN;
const refreshTokenSecret = process.env.REFRESH_TOKEN;

export const registerUser = async (req, res) => {
   try {
      const {
         username,
         email,
         password
      } = req.body;

      const tokenVerify = req.cookies.accessToken;

      if (tokenVerify) {
         return res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: "User already logged in."
         });
      }

      if (!/^[0-9a-zA-Z!@#$%^&*()_+]+$/.test(password)) {
         return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            message: "Password can only contain letters (a-z, A-Z), numbers (0-9), and special characters (!@#$%^&*()_+)."
         });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
         username, email, password: hashedPassword
      });

      const verificationToken = jwt.sign({
         id: newUser.userId
      }, accessTokenSecret, {
         expiresIn: '1d'
      });

      return res.status(200).json({
         status: 'success',
         statusCode: 200,
         message: "User account created successfully!"
      });

   } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
         return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: error.errors[0].message,
            field: error.errors[0].path ? error.errors[0].path: null
         });
      } else {
         return res.status(404).json({
            status: 'error',
            statusCode: 404,
            message: error.message
         });
      }
   }
};

export const loginUser = async (req, res) => {
   try {
      const {
         email,
         password
      } = req.body;

      const tokenVerify = req.cookies.accessToken;

      if (tokenVerify) {
         return res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: "User already logged in."
         });
      }

      const user = await User.findOne({
         where: {
            email
         }
      });

      if (!user) {
         return res.status(404).json({
            status: 'error',
            statusCode: 404,
            message: "User Not Found!"
         });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({
         status: 'error',
         statusCode: 401,
         message: "Incorrect password. Please try again."
      });

      const accessToken = jwt.sign({
         id: user.userId
      }, accessTokenSecret, {
         expiresIn: '15m'
      });
      const refreshToken = jwt.sign({
         id: user.userId
      }, refreshTokenSecret, {
         expiresIn: '7d'
      });

      user.refreshToken = refreshToken;
      await user.save();

      // Set the tokens in cookies
      res.cookie('accessToken', accessToken, {
         httpOnly: true, // Prevents JavaScript from accessing the token
         maxAge: 15 * 60 * 1000, // 15 minutes
         secure: process.env.NODE_ENV === 'production', // Only send in HTTPS if in production,
         sameSite: 'Strict'
      });

      res.cookie('refreshToken', refreshToken, {
         httpOnly: true,
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'Strict'
      });

      // Redirect to homepage after login
      return res.status(200).json({
         status: 'success',
         statusCode: 200,
         message: "User logged in successfully!"
      });
   } catch (error) {
      return res.status(404).json({
         status: 'error',
         statusCode: 404,
         message: error.message
      });
   }
};

export const updateProfile = async (req, res) => {
   try {
      const {
         name,
         username,
         description,
         link
      } = req.body;

      const tokenVerify = req.cookies.accessToken;

      if (!tokenVerify) {
         return res.status(401).json({
            status: 'fail',
            statusCode: 401,
            message: "Authentication required. Please log in to update your profile."
         });
      }

      jwt.verify(tokenVerify, accessTokenSecret, async (err, user) => {
         if (err) {
            return res.status(401).json({
               status: 'fail',
               statusCode: 401,
               message: 'Invalid or expired token. Please try to refresh or login again.'
            });
         }

         const userData = await User.findOne({
            where: {
               user_id: user.id
            }
         });

         if (!userData) {
            return res.status(404).json({
               status: 'fail',
               statusCode: 404,
               message: 'User not found.'
            });
         }

         // Update user data
         userData.name = name;
         if (description) {
            userData.description = description;
         }
         userData.username = username;
         if (link) {
            userData.link = link;
         }

         // Try to save and catch potential validation errors
         try {
            await userData.save();
            return res.status(200).json({
               status: 'success',
               statusCode: 200,
               message: 'Profile Updated.'
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
               message: 'An error occurred while saving the profile. Please try again.'
            });
         }
      });
   } catch (error) {
      return res.status(500).json({
         status: 'error',
         statusCode: 500,
         message: 'An internal server error occurred.'
      });
   }
};

// Refresh user access token once expired
export const refreshAccessToken = async (req, res, next, redirect = true) => {
   const refreshToken = req.cookies.refreshToken;

   if (!refreshToken) {
      if (redirect) {
         return res.redirect('/auth/login');
      } else {
         return 'unauthorised';
      }
   }

   try {

      const user = await User.findOne({
         where: {
            refreshToken
         }
      });
      if (!user) {
         res.clearCookie('accessToken');
         res.clearCookie('refreshToken');
         if (redirect) {
            return res.redirect('/auth/login');
         } else {
            return 'unauthorised';
         }
      }

     await jwt.verify(refreshToken, refreshTokenSecret, (err, decoded) => {
         if (err) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            if (redirect) {
               return res.redirect('/auth/login');
            } else {
               return 'unauthorised';
            }
         }

         const newAccessToken = jwt.sign({
            id: decoded.id
         }, accessTokenSecret, {
            expiresIn: '15m'
         });

         // Set the new access token in cookies
         res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000, // 15 minutes
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
         });

         return next();
      });
   } catch (error) {
      if (redirect) {
         return res.redirect('/auth/login');
      } else {
         return 'unauthorised';
      }
   }
};

// Verify user email
export const verifyEmail = async (req,
   res) => {
   const {
      token
   } = req.query;

   try {
      const decoded = jwt.verify(token,
         accessTokenSecret);

      await User.update({
         authVerified: true
      },
         {
            where: {
               user_id: decoded.id
            }
         });
      res.redirect('/');
   } catch (error) {
      return res.status(403).json({
         status: 'error',
         statusCode: 403,
         message: "Invalid Token!"
      });
   }
};