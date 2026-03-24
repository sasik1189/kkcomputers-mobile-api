import client from '../database_connect';

/* CRUD actions for the Prodect table */
//define the Typescript type for order table
export type Subscription = {
  subscriptionId: string;
  name: string;
  price: string;
  paymentPrice: number;
};

export class SubscriptionModel {
  //get active subscriptions by user
  async getActiveSubscriptions(): Promise<Subscription[] | null> {
    try {
      const sql = `SELECT subscription_id, name, price FROM subscriptions WHERE is_active=$1 Order by sort asc`;
      const connection = await client.connect();

      const result = await connection.query(sql, [true]);
      if (result.rows.length) {
        return result.rows.map((r) => {
          return {
            subscriptionId: r.subscription_id,
            name: r.name,
            price: Number(r.price).toFixed(2),
            paymentPrice: Number(r.price) * 100,
          };
        });
      }
      connection.release();
      return null;
    } catch (err) {
      throw new Error(`${err}`);
    }
  }

  async getUserActiveSubscription(
    userId: string
  ): Promise<Subscription[] | null> {
    try {
      const sql = `SELECT s.subscription_id, s.name, s.price, us.valid_till FROM users u
        JOIN user_subscriptions us ON u.user_id = us.user_id 
        JOIN subscriptions s ON us.subscription_id = s.subscription_id 
        WHERE u.user_id = $1 and CURRENT_DATE <= date(us.valid_till)`;
      const connection = await client.connect();

      const result = await connection.query(sql, [userId]);
      connection.release();
      if (result.rows.length) {
        return result.rows.map((r) => {
          const validTill = new Date(r.valid_till);

          return {
            subscriptionId: r.subscription_id,
            name: r.name,
            price: Number(r.price).toFixed(2),
            paymentPrice: Number(r.price) * 100,
            validTill: `${validTill.getDay()}/${
              validTill.getMonth() + 1
            }/${validTill.getFullYear()}`,
          };
        });
      } else {
        return [
          {
            subscriptionId: '',
            name: 'Free User',
            price: '0.00',
            paymentPrice: 100,
          },
        ];
      }
    } catch (err) {
      throw new Error(`${err}`);
    }
  }

  // verifySubscription
  async verifySubscription(userId: string): Promise<boolean> {
    try {
      const sql = `SELECT user_id FROM user_subscriptions WHERE user_id = $1 and CURRENT_DATE <= date(valid_till)`;
      const connection = await client.connect();

      const result = await connection.query(sql, [userId]);
      connection.release();
      return result.rows.length > 0;
    } catch (err) {
      throw new Error(`${err}`);
    }
  }
}
