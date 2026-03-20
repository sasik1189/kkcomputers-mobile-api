import { Router } from 'express';
import * as controllers from '../../controllers/subscription.controllers';
import { verifyAuthToken } from '../../../middleware/authToken';

//invoke fn Router
const subscriptionRoutes = Router();

//Get the subsriptions, token required
subscriptionRoutes.get(
  '/active',
  verifyAuthToken,
  controllers.getActiveSubscriptions
);

subscriptionRoutes.get(
  '/user',
  verifyAuthToken,
  controllers.getUserActiveSubscription
);

export default subscriptionRoutes;
