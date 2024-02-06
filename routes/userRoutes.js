const express = require('express');
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authControllers');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup); // signup
userRouter.post('/login', authController.login); // login
userRouter.post('/logout', authController.logout);

// Protect all routes after this middleware to be accessed only by logged in users
// userRouter.use(authController.protect);

userRouter
  .route('/me')
  .get(authController.protect, userController.getMe, userController.getUser); // get the current user
userRouter.patch('/updateMe', authController.protect, userController.updateMe); // update user
userRouter.delete('/deleteMe', authController.protect, userController.deleteMe); // delete user
userRouter.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
); // update password

// userRouter.use(authController.restrictTo('admin')); // restrict all routes after this middleware to admin only

userRouter.patch(
  '/deposit',
  authController.protect,
  authController.restrictTo('buyer'),
  userController.deposit
);
userRouter.patch(
  '/reset',
  authController.protect,
  authController.restrictTo('buyer'),
  userController.resetDeposit
);
userRouter.post(
  '/buy',
  authController.protect,
  authController.restrictTo('buyer'),
  userController.buyProduct
);
userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = userRouter;
