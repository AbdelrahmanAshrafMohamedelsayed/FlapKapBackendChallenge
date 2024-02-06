const crypto = require('crypto'); // built-in node module
const { promisify } = require('util'); // built-in node module
const jwt = require('jsonwebtoken');
const User = require('./../Models/userModel');
const catchAsync = require('./../util/catchAsync');
const ErrorHandling = require('./../util/ErrorHandling');
const Email = require('./../util/email');

const signToken = id => {
  // console.log('🔥🔥🔥🔥🔥🔥', process.env.JWT_EXPIRES_IN);
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  }); // create the token
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  // const user = await User.create(req.body); // create a new document in the collection 'User' // it's good but not secure

  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    deposit: req.body.deposit,
    role: req.body.role
  }); // create a new document in the collection 'User'
  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body; // get the email and password from the request body
  // 1) Check if email and password exist
  if (!username || !password) {
    return next(
      new ErrorHandling('Please provide username and password!', 400)
    ); // 400 means bad request
  }
  // 2) Check if user exists && password is correct
  // we need to select the password because it is not selected by default , + means select
  const user = await User.findOne({ username }).select('+password'); // get the user from the database
  // console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  // console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  // console.log(user);
  // 3) If everything ok, send token to client
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new ErrorHandling('Incorrect username or password', 401)); // 401 means unauthorized
  }
  // console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  // console.log(user);
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
  createSendToken(user, 200, res);
});
exports.protect = catchAsync(async (req, res, next) => {
  console.log('kjgdggffddfkk');

  // console.log('req.headers', req.body);
  // 1) Getting token and check if it's there
  let token;
  // console.log('req.headers', req.headers);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; // get the token from the request header
    // console.log('token', token);
  }
  if (!token) {
    return next(
      new ErrorHandling(
        'You are not logged in! Please log in to get access.',
        401
      )
    ); // 401 means unauthorized
  }
  // 2) Verification token
  // console.log('process.env.JWT_SECRET', process.env.JWT_SECRET);
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // verify the token

  // if we reach this line, it means that the token is valid otherwise an error will be thrown and we will go to the error handling middleware

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id); // get the user from the database
  if (!currentUser) {
    return next(
      new ErrorHandling(
        'The user belonging to this token does no longer exist.',
        401
      )
    ); // 401 means unauthorized
  }
  // 4) Check if user changed password after the token was issued
  // currentUser.passwordChanged(decoded.iat);
  if (currentUser.passwordChanged(decoded.iat)) {
    return next(
      new ErrorHandling(
        'User recently changed password! Please log in again.',
        401
      )
    ); // 401 means unauthorized
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; // we can use this user in the next middleware
  // console.log('req.user 💥 💥 💥 💥 💥 💥 💥', req.user);
  next();
});
exports.restrictTo = (...roles) => {
  // we will reach this function after the protect middleware which means that the user is logged in
  // and you will notice that in the protect middleware we set the user in the request object then we can use it here
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // console.log(req.user.role);
      return next(
        new ErrorHandling(
          'You do not have permission to perform this action',
          403
        )
      ); // 403 means forbidden
    }
    next(); // if the user has the permission, we will go to the next middleware
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log('kjgdggffddfkk');

  // 1) Get user from collection
  // console.log(req.body);
  const { _id: id } = req.user; // destructuring
  console.log(id + 'kjkk');
  const user = await User.findById(id).select('+password');
  // if(!user){
  // } // no need he should have been loged in already
  // console.log(user + 'upppppppppppppp');
  //2) check if the current password is correct
  const {
    currentPassword,
    password: newPassword,
    passwordConfirm: passwordNewConfirm
  } = req.body;
  // console.log(req.body);
  // if (currentPassword !== user.password) {
  //   return next(new ErrorHandling('Your current password is wrong.', 401));
  // }
  if (!user || !(await user.correctPassword(currentPassword, user.password))) {
    return next(new ErrorHandling('Your current password is wrong.', 401));
  }
  //3) update password
  user.password = newPassword; // set the new password
  user.passwordConfirm = passwordNewConfirm; // set the new password confirm
  await user.save(); // save the user in the database we don't need to use validateBeforeSave:false because we need to validate the password and password confirm like length and match
  // after update we need update userChange password but it is done in  pre save middle were

  // 4) login

  createSendToken(user, 200, res);
});
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};
