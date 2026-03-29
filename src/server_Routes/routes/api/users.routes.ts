import { Router } from 'express';
import * as controllers from '../../controllers/user.controllers';
import { verifyAuthToken } from '../../../middleware/authToken';
import {
  validateRegistration,
  validateLogin,
  validateMobile,
  validateGoogleLogin,
} from '../../../middleware/validation';
import rateLimit from 'express-rate-limit';

const loginSignupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // Only 5 failed attempts per hour
  message: 'Too many login attempts, please try again in an hour.',
});

//invoke fn Router
const usersRoutes = Router();

usersRoutes.post(
  '/verify_mobile',
  loginSignupLimiter,
  validateMobile,
  controllers.verifyMobile
);

//Once you create a new user, Store the token & use it for future HTTP requests
usersRoutes.post(
  '/signup',
  loginSignupLimiter,
  validateRegistration,
  controllers.create
);
//to index all users, token required
// usersRoutes.get('/', verifyAuthToken, controllers.getAllUsers);
//to show a sepecific user, token required
usersRoutes.get('/profile', verifyAuthToken, controllers.getUser);
//Authenticate user (login)
usersRoutes.post(
  '/login',
  loginSignupLimiter,
  validateLogin,
  controllers.authenticate
);
//to delete a sepecific user, token required
// usersRoutes.delete('/:id', verifyAuthToken, controllers.deleteUser);

usersRoutes.post(
  '/google_login',
  loginSignupLimiter,
  validateGoogleLogin,
  controllers.googleAuthenticate
);

export default usersRoutes;
