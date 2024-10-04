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
   const url = `http://localhost:3000/auth/verify?token=${token}`;
   console.log(userEmail, token)
   try {
      await transporter.sendMail({
         to: userEmail,
         subject: 'Verify your email',
         html: `<!DOCTYPE html>
         <html lang="en">
         <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <title>Email Verification</title>
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
         <h1>Email Verification</h1>
         <p>Dear <strong>User</strong>,</p>
         <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
         <a href="${url}" class="button">Verify Email</a>
         <p>If you did not create an account, no further action is required.</p>
         <p>Best regards,<br><strong>HnverBook</strong></p>
         </div>
         </body>
         </html>`
      });
   } catch (error) {
      console.error(error)
   }
};