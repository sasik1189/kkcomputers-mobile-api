import { Request, Response, NextFunction } from 'express';
import { SubscriptionModel } from '../../endpoint/models/subscription.row.model';

//instance from the OrderModel class
const subscriptionModel = new SubscriptionModel();

//Get completed subs by the user
export const getActiveSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subscriptions = await subscriptionModel.getActiveSubscriptions();
    res.json({
      data: subscriptions,
      message: 'Done.. active subscriptions retrieved',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: String(error),
    });
  }
};
