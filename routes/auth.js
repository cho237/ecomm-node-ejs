const express = require('express');

const {check ,body }  = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

const User = require('../models/users');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login',
    [
      body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail(),
      body('password', 'Password has to be valid.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
    ],
    authController.postLogin
  );


router.post('/signup',[
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value,{req})=>{
        return User.findOne({email:value})
            .then(userDoc=>{
                if(userDoc){
                    return Promise.reject('Email already used ,chose another email');
                }
            })  
          })
          .normalizeEmail(),
    body('password',
    'please enter password with only numbers and text with at least 5 characters'
    )
        .isLength({min: 5})
        .isAlphanumeric()
        .trim(),
    body('confirmPassword').trim().custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Passwords do not match')
        };
        return true;
   })
], 
 authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;