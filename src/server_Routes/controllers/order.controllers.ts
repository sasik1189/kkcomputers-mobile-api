import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../../endpoint/models/order.row.model';
import { createHmac } from 'crypto';
import Razorpay from 'razorpay';

//instance from the OrderModel class
const orderModel = new OrderModel();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//create an order
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const razorpayRes = await razorpayInstance.orders.create({
      amount: req.body.price,
      currency: "INR",
      receipt: req.body.subscriptionId,
      notes: {
        userId: req.body.userId
      }
    });

    const order = await orderModel.create(razorpayRes.id, req.body);
    res.json({
      data: order,
      message: 'Done.. order created',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: String(error),
    });
  }
};

export const success = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const generatedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(req.body.razorpayOrderId + "|" + req.body.paymentId)
      .digest('hex');

    if (generatedSignature == req.body.signature) {
      await orderModel.success(req.body);
      res.json({
        message: 'Done.. success order updated',
      });

    } else {
      res.status(401);
      res.json({
        message: 'Invalid Payment',
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: String(error),
    });
  }
};

export const failure = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await orderModel.failure(req.body);
    res.json({
      message: 'Done.. failed order updated',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: String(error),
    });
  }
};

//Add orders to a spesific product or add products to a spesific order by the user
export const addProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const addProduct = await orderModel.addProduct(
      parseInt(req.body.quantity),
      parseInt(req.body.orderId),
      parseInt(req.body.productId)
    );
    res.json({
      data: { addProduct },
      message: 'Done.. added a new order to this product.. happy shopping:)',
    });
  } catch (error) {
    next(error);
  }
};

//Get current order by user
export const getCurrentOrderByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentOrder = await orderModel.getCurrentOrderByUser(
      req.body.userId as unknown as number
    );
    res.json({
      data: currentOrder,
      message:
        'Done.. products of the current order by the user retrieved.. happy shopping:)',
    });
  } catch (error) {
    next(error);
  }
};
//Get completed orders by the user
export const completedOrdersByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentOrder = await orderModel.completedOrdersByUser(
      req.body.userId as unknown as number
    );
    res.json({
      data: currentOrder,
      message: 'Done.. completed orders by the user retrieved',
    });
  } catch (error) {
    next(error);
  }
};
