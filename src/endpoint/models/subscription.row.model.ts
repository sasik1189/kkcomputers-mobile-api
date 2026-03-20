import client from '../database_connect';

/* CRUD actions for the Prodect table */
//define the Typescript type for order table
export type Subscription = {
  subscriptionId: string;
  name: string;
  price: string;
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
          };
        });
      }
      connection.release();
      return null;
    } catch (err) {
      throw new Error(`${err}`);
    }
  }
}
