import { nanoid } from 'nanoid';
import client from '../database_connect';

/* CRUD actions for the Prodect table */
//define the Typescript type for order table
export type Order = {
  userId: number;
  status: string;
  subscriptionId: string;
};

type SuccessOrder = {
  userId: string;
  orderId: string;
  paymentId: string;
  signature: string;
};

type FailureOrder = {
  orderId: string;
  message: string;
};

type CreatedOrder = {
  orderId: string;
  razorpayId: string;
};

//define the Typescript type for order_products table
export type OrderProducts = {
  id: number;
  quantity: number;
  orderId: number;
  subscriptionId: number;
};

export class OrderModel {
  //create a new user order
  // the method needs to be asynchronous because all calls to the database will be promises
  async create(razorpayOrderId: string, o: Order): Promise<CreatedOrder> {
    try {
      //open connection with database
      const connection = await client.connect();
      const orderId: string = nanoid();

      const sql = `INSERT INTO orders (order_id, razorpay_order_id, user_id, subscription_id, status, created_at)
           VALUES($1, $2, $3, $4, $5, now()) RETURNING order_id, razorpay_order_id`;
      //run query
      const result = await connection.query(sql, [
        orderId,
        razorpayOrderId,
        o.userId,
        o.subscriptionId,
        'NEW',
      ]);
      //release connection
      connection.release();
      //return created ORDER
      return {
        orderId: result.rows[0]['order_id'],
        razorpayId: razorpayOrderId,
      };
    } catch (error) {
      throw new Error(`Sorry unable to create a new order.Error: ${error}`);
    }
  }

  async success(o: SuccessOrder): Promise<null> {
    let isTransactionBegin: boolean = false;
    try {
      //open connection with database

      const connection = await client.connect();
      const sql = `UPDATE orders set payment_id = $2, signature = $3, status = $4, payment_received_at = now()
          where order_id = $1 RETURNING subscription_id`;
      //run query
      await connection.query('BEGIN');
      isTransactionBegin = true;
      try {
        const updateOrder = await connection.query(sql, [
          o.orderId,
          o.paymentId,
          o.signature,
          'SUCCESS',
        ]);

        if (updateOrder.rows.length) {
          const subscriptionId = updateOrder.rows[0]['subscription_id'];
          const subSql = `SELECT subscription_id, valid_days FROM subscriptions WHERE subscription_id=$1`;
          const subResult = await connection.query(subSql, [subscriptionId]);
          if (subResult.rows.length) {
            const subscriptionDays: number = subResult.rows[0]['valid_days'];
            const insertSql = `INSERT INTO user_subscriptions (user_id, subscription_id, order_id, created_at, valid_till) VALUES 
                  ($1, $2, $3, now(), CURRENT_DATE + ($4 || ' days')::interval)`;
            //run query
            await connection.query(insertSql, [
              o.userId,
              subscriptionId,
              o.orderId,
              subscriptionDays
            ]);
          }
        }
        await connection.query('COMMIT');
        isTransactionBegin = false;

        //release connection
        connection.release();
      } catch (error) {
        if (isTransactionBegin) {
          await connection.query('ROLLBACK');
        }
        throw error;
      }
      //return created ORDER
      return null;
    } catch (error) {
      throw new Error(
        `Sorry unable to update the success order.Error: ${error}`
      );
    }
  }

  async failure(o: FailureOrder): Promise<null> {
    try {
      //open connection with database

      const connection = await client.connect();
      const sql = `UPDATE orders set message = $2, status = $3, payment_received_at = now()
          where order_id = $1`;
      //run query
      await connection.query(sql, [
        o.orderId,
        o.message,
        'FAILED',
      ]);

      //release connection
      connection.release();

      //return created ORDER
      return null;
    } catch (error) {
      throw new Error(
        `Sorry unable to update the failed order. Error: ${error}`
      );
    }
  }

  //add orders to a spesific product or add  products to a spesific order
  async addProduct(
    quantity: number,
    orderId: number,
    productId: number
  ): Promise<OrderProducts> {
    // get order to see if it is active
    try {
      const ordersql = 'SELECT * FROM orders WHERE id = $1';
      const connection = await client.connect();

      const result = await connection.query(ordersql, [orderId]);

      const order = result.rows[0];

      //status is a switch (1 means active)
      if (order.status !== 'active') {
        throw new Error(
          `Sorry unable to add product ${productId} to order ${orderId} because order is closed`
        );
      }

      connection.release();
    } catch (err) {
      throw new Error(`${err}`);
    }
    try {
      const connection = await client.connect();
      const sql =
        'INSERT INTO order_products (quantity, order_id, product_id) VALUES($1, $2, $3) RETURNING *';

      const result = await connection.query(sql, [
        quantity,
        orderId,
        productId,
      ]);

      connection.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Sorry unable to add product ${productId} to order ${orderId}: ${err}`
      );
    }
  }

  //get current order by user
  async getCurrentOrderByUser(userId: number): Promise<OrderProducts[] | null> {
    try {
      const sql = 'SELECT * FROM orders WHERE user_id=$1';
      const connection = await client.connect();

      const result = await connection.query(sql, [userId]);
      if (result.rows.length) {
        const status = 'active';
        const sql = `SELECT * FROM orders WHERE status=$1 ORDER BY id DESC`;

        const result2 = await connection.query(sql, [status]);

        const currentOrderId = result2.rows[0].id;
        const ordersql = `SELECT * FROM order_products WHERE order_id=${currentOrderId}`;
        //return products of the current active order by the user
        const result3 = await connection.query(ordersql);
        return result3.rows;
      }
      connection.release();
      return null;
    } catch (err) {
      throw new Error(`${err}`);
    }
  }

  //get completed order by user
  async completedOrdersByUser(userId: number): Promise<Order[] | null> {
    try {
      const sql = `SELECT * FROM orders WHERE user_id=$1`;
      const connection = await client.connect();

      const result = await connection.query(sql, [userId]);
      if (result.rows.length) {
        const status = 'complete';
        const sql = `SELECT * FROM orders WHERE status=$1`;

        const result2 = await connection.query(sql, [status]);
        //return the completed orders by the user .. guess what! i did it.. thank you udacity.. now i became an e-commerce's api expert ;)
        return result2.rows;
      }
      connection.release();
      return null;
    } catch (err) {
      throw new Error(`${err}`);
    }
  }
}
