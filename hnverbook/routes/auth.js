import express from 'express';
var authRouter = express.Router();
import {
   registerUser,
   loginUser,
   refreshAccessToken,
   verifyEmail,
   updateProfile
} from '../controllers/user.controller.js';
import jwt from 'jsonwebtoken';
import "dotenv/config.js";
import {
   authCheckLogin,
   authCheckSignUp
} from '../middlewares/authenticate.js';

import {
   sendVerificationEmail
} from '../utils/sendEmailVerification.js';

import {
   User
} from '../models/user.js';

const accessTokenSecret = process.env.ACCESS_TOKEN;
const refreshTokenSecret = process.env.REFRESH_TOKEN;


authRouter.get('/login', authCheckLogin, function(req, res, next) {
   res.setHeader('Cache-Control', 'no-store');
   const theme = req.cookies.theme || 'light';
   res.render('login', {
      title: "Login | HnverBook",
      theme
   });
});

authRouter.get('/signup', authCheckSignUp, function(req, res, next) {
   res.setHeader('Cache-Control', 'no-store');
   const theme = req.cookies.theme || 'light';
   res.render('signup', {
      title: "Sign Up | HnverBook",
      theme
   });
});

authRouter.get('/verify/resetpassword', async function(req, res, next) {
   try {
      const theme = req.cookies.theme || 'light';
      const resetPassToken = process.env.RESET_PASS_TOKEN
      let token = req.query.token;
      
     jwt.verify(token, resetPassToken, async (err, user) => {
         if (err) {
            console.log(err)
            return res.status(404).send(`<p>Invalid token. Please request a new link to reset.</p><a href="/account/reset-password">Click Here</a>`)
         }

         res.render('account/reset-password',
            {
               title: "Reset Password | HnverBook",
               theme,
               message: null,
               continueReset: true
            });
      });
} catch (error) {
   return res.status(404).json({
      status: 'error',
      statusCode: 404,
      message: error.message
   });
}
});

authRouter.post('/logout', function(req, res, next) {
   res.clearCookie('accessToken');
   res.clearCookie('refreshToken');
   res.redirect('/auth/login');
});

authRouter.get('/logout', function(req, res, next) {
   res.clearCookie('accessToken');
   res.clearCookie('refreshToken');
   res.redirect('/auth/login');
});

authRouter.post('/signup', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/verify', verifyEmail);

authRouter.post('/requestVerification', async function (req, res, next) {

   try {
      const token = req.cookies.accessToken;

      if (!token) {
         return res.status(404).json({
            message: "User is not logged in or an invalid request."
         });
      }

      jwt.verify(token,
         accessTokenSecret,
         async (err, user) => {
            if (err) {
               return refreshAccessToken(req, res, next);
            }

            const userData = await User.findByPk(user.id, {
               attributes: ['username', 'email']
            });

            if (!userData) return res.status(404).render('error', {
               message: "User not found!"
            });

            const token = req.cookies.accessToken;

            await sendVerificationEmail(userData.email, token, res);

            return res.status(200).json({
               message: "A new verification link has been sent to your e-mail!"
            });
         });

   } catch (error) {
      console.error("Error sending verification e-mail:",
         error);
      return res.status(500).json({
         message: "An internal error occurred."
      });
   }
});

authRouter.post('/update/profile', updateProfile);

authRouter.post('/refresh', refreshAccessToken);

export default authRouter;