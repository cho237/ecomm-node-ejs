const path = require('path');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const uniqid = require('uniqid')
const bodyparser = require('body-parser');

const mongoose = require('mongoose');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const csrt = require('csurf');
const flash = require('connect-flash');
const multer = require('multer')

const errorController = require('./controllers/error');
const User = require('./models/users')

const MONGODB_URI = 'mongodb+srv://cho237:atenchong@cluster0.cblz1.mongodb.net/shop'


const app = express();

const store = new MongoDBStore({
   uri: MONGODB_URI,
   collection: 'sessions'
 });

const csrfProtection = csrt();

const fileStorage = multer.diskStorage({
  destination: 'images',
  filename: (req, file, cb) => {
    cb(null, uniqid('',  `-${file.originalname}`));
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine','ejs');
app.set('views','views');

 const adminRoutes=require('./routes/admin');

 const shoproutes = require('./routes/shop')
 const authroutes = require('./routes/auth')

app.use(bodyparser.urlencoded({extended:false}));
app.use(
  multer({storage:fileStorage , fileFilter:fileFilter}).single('image')
);
app.use(express.static(path.join(__dirname,'public')));
app.use('/images', express.static(path.join(__dirname,'images')));
app.use(
   session({
     secret: 'my secret',
     resave: false,
     saveUninitialized: false,
     store: store
   })
 );
app.use(csrfProtection)
app.use(flash())

app.use((req,res,next)=>{
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
   next()     
})

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin',adminRoutes );
app.use(shoproutes);
app.use(authroutes);

app.use('/500', errorController.get500); 

app.use(errorController.get404); 

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: ''
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });

