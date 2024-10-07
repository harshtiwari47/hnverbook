import jwt from 'jsonwebtoken';
import "dotenv/config.js";
import {
   refreshAccessToken
} from '../controllers/user.controller.js';
import {
   User
} from '../models/user.js';


const accessTokenSecret = process.env.ACCESS_TOKEN;
const refreshTokenSecret = process.env.REFRESH_TOKEN;


export const verifyUser = async (req, res, next) => {
   const token = req.cookies.accessToken;

   if (!token) {
      return refreshAccessToken(req, res, next);
   }

   jwt.verify(token,
      accessTokenSecret,
      async (err, user) => {
         if (err) {
            return refreshAccessToken(req, res, next);
         }

         const userData = await User.findByPk(user.id, {
            attributes: ['authVerified']
         });

         if (userData && userData.authVerified) {
            req.user = user;
            return next();
         } else if (userData) {
            return res.redirect('/account/verify')
         } else {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.redirect('/auth/login')
         }
      });
}

export const userDetail = async (req, res, next) => {
   const token = req.cookies.accessToken;

   if (!token) {
      if (refreshAccessToken(req, res, next, false) === 'unauthorised') {
         req.user = {}
         req.user.id = undefined;
         return next();
      } else {
         return refreshAccessToken(req, res, next, false);
      }
   }

   jwt.verify(token,
      accessTokenSecret,
      async (err, user) => {
         if (err) {
            req.user = {}
            req.user.id = undefined;
            return next();
         }

         const userData = await User.findByPk(user.id, {
            attributes: ['authVerified']
         });

         if (userData && userData.authVerified) {
            req.user = user;
            return next();
         } else if (userData) {
            req.user = {}
            req.user.id = undefined;
            return next();
         } else {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            req.user = {}
            req.user.id = undefined;
            return next();
         }
      });
}

export const authCheckLogin = async (req, res, next) => {
   const token = req.cookies.accessToken;

   if (!token) {
      return next();
   }

   jwt.verify(token,
      accessTokenSecret,
      async (err, user) => {
         if (err) {
            return refreshAccessToken(req, res, next);
         }

         const userData = await User.findByPk(user.id, {
            attributes: ['authVerified']
         });

         if (userData) {
            return res.redirect('/')
         } else if (!userData) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.redirect('/auth/signup')
         }
         return next();
      });
}

export const authCheckSignUp = async (req, res, next) => {
   const token = req.cookies.accessToken;

   if (!token) {
      return next();
   }

   jwt.verify(token,
      accessTokenSecret,
      async (err, user) => {
         if (err) {
            return refreshAccessToken(req, res, next);
         }

         const userData = await User.findByPk(user.id, {
            attributes: ['authVerified']
         });

         if (userData) {
            return res.redirect('/')
         } else if (!userData) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return next();
         }
         return next();
      });
}