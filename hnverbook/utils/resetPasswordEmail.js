import nodemailer from 'nodemailer';
import "dotenv/config.js";

const transporter = nodemailer.createTransport({
   host: 'smtp.gmail.com',
   port: 465,
   secure: true,
   //  service: 'gmail',
   auth: {
      user: 'dynamicsartsin@gmail.com',
      pass: process.env.MAIL_PASS
   }
});

export const sendVerificationEmail = async (userEmail, token, res) => {
   const url = `http://localhost:3000/auth/verify/resetpassword?token=${token}`;
   try {
      await transporter.sendMail({
         to: userEmail,
         subject: 'Reset Password | HnverBook',
         html: `<!DOCTYPE html>
         <html lang="en">
         <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <title>Reset Password</title>
         <style>
         body {
         font-family: Arial, sans-serif;
         background-color: #f4f4f4;
         padding: 20px;
         }
         .container {
         background-color: #ffffff;
         padding: 20px;
         border-radius: 5px;
         box-shadow: 0 2px 5px rgba(0,0,0,0.1);
         max-width: 600px;
         margin: auto;
         }
         h1 {
         color: #333;
         }
         p {
         padding: 8px 0;
         }
         .button {
         display: inline-block;
         padding: 10px 15px;
         color: white;
         background-color: #3b68d5;
         text-decoration: none;
         border-radius: 5px;
         margin: 8px 0;
         }
         </style>
         </head>
         <body>
         <div class="container">
         <h1>Reset Password</h1>
         <p>Dear <strong>User</strong>,</p>
         <p>We have received a request to reset the password associated with your account. To proceed with resetting your password, please click the button below:</p>
         <a href="${url}" class="button">Reset Password</a>
         <p>If you did not initiate this request, you can safely ignore this email. Your account will remain secure, and no changes will be made.</p>
         <p>Kind regards,<br><strong>HnverBook Support Team</strong></p>
         </div>
         </body>
         </html>`
      });
   } catch (error) {
      console.error(error)
   }
};