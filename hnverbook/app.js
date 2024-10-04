import express from 'express';
import path from 'path';
import {
   fileURLToPath
} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cookieParser from 'cookie-parser';
import sequelize from './database.js';

import {
   APIError,
   handleError
} from './utils/APIError.js';

import indexRouter from './routes/index.js';
import authRouter from './routes/accounts/auth.js';
import accountRouter from './routes/accounts/account.js';
import iconRouter from './routes/icons.js';
import postsRouter from './routes/posts.js';
import settingsRouter from './routes/settings.js';
import exploreRouter from './routes/explore.js';
import notesRouter from './routes/notes.js';

const app = express();
sequelize.sync().then(() => {
   console.log('database is listening!');
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({
   extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => {
   handleError(err, res);
});


app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/icon', iconRouter);
app.use('/account', accountRouter);
app.use('/', postsRouter);
app.use('/settings', settingsRouter);
app.use('/explore', exploreRouter);
app.use('/notes', notesRouter);

app.use((req, res, next) => {
   const theme = req.cookies.theme || 'light';
   res.status(404).render('404', {
      theme
   });
});

export {
   app
}