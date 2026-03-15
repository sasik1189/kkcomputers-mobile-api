import client from '../database_connect';
import bcrypt from 'bcrypt';
import config from '../../env_variables_config/config';
import { nanoid } from 'nanoid';

/* CRUD actions for the User table */
//define the Typescript type for user table
export type User = {
  id: number;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  shopName: string;
  token: string;
};

export type LoginUser = {
  userId: string;
  name: string;
  shopName: string;
  email?: string;
  mobile?: string;
  password?: string;
};

//This class is going to be the representation of the database (postgres ambassador in js)
export class UserModel {
  //create a new user(register)
  // the method needs to be asynchronous because all calls to the database will be promises

  async checkMailOrPhone(u: User): Promise<string> {
    try {
      //open connection with database
      const connection = await client.connect();

      const checkSql = 'SELECT * FROM users WHERE email = $1 or mobile = $2';

      const checkResult = await connection.query(checkSql, [u.email, u.mobile]);

      if (checkResult.rows.length) {
        const checkResultValue = checkResult.rows[0];
        if (checkResultValue.email === u.email) {
          return `Email already exists`;
        }
        if (checkResultValue.mobile === u.mobile) {
          return `Mobile number already exists`;
        }
      }
      //release connection
      connection.release();
      //return created user
      return '';
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  async create(u: User): Promise<User | string> {
    try {
      //open connection with database
      const connection = await client.connect();

      const checkSql = 'SELECT * FROM users WHERE email=$1 or mobile = $2';

      const checkResult = await connection.query(checkSql, [u.email, u.mobile]);

      if (checkResult.rows.length) {
        const checkResultValue = checkResult.rows[0];
        if (checkResultValue.email === u.email) {
          return `Email already exists`;
        }
        if (checkResultValue.mobile === u.mobile) {
          return `Mobile number already exists`;
        }
      }
      const userId: string = nanoid();
      const sql = `INSERT INTO users (user_id, name, email, mobile, shop_name, password) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`;
      //hash password
      const hash = bcrypt.hashSync(
        (u.password + config.pepper) as string,
        parseInt(config.salt as string, 10)
      );
      //run query
      const result = await connection.query(sql, [
        userId,
        u.name,
        u.email,
        u.mobile,
        u.shopName,
        hash,
      ]);
      //release connection
      connection.release();
      //return created user
      return result.rows[0];
    } catch (error) {
      throw new Error(`${error}`);
    }
  }
  //get all users
  async getAllUsers(): Promise<User[]> {
    try {
      //open connection with database
      const connection = await client.connect();
      const sql = `SELECT id, first_name, last_name FROM users`;
      //run query
      const result = await connection.query(sql);
      //release connection (close the opened connection after done)
      connection.release();
      //return all users
      return result.rows;
    } catch (error) {
      throw new Error(`Sorry unable to find users.Error: ${error}`);
    }
  }
  //get specific user
  async getUser(userId: string): Promise<LoginUser | null> {
    try {
      //open connection with database
      const connection = await client.connect();
      const sql = `SELECT name, mobile, email, shop_name FROM users WHERE user_id = $1`;
      //run query
      const result = await connection.query(sql, [userId]);

      //release connection
      connection.release();
      if (result.rowCount > 0) {
        const resultUser = result.rows[0];
        return {
          name: resultUser.name,
          userId: resultUser.user_id,
          shopName: resultUser.shop_name,
          email: resultUser.email,
          mobile: resultUser.mobile,
        };
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(`Sorry unable to user ${userId}.Error: ${error}`);
    }
  }
  //delete a user
  async deleteUser(id: number): Promise<User> {
    try {
      //open connection with database
      const connection = await client.connect();
      const sql = `DELETE FROM users WHERE id= $1 RETURNING id`;
      //run query
      const result = await connection.query(sql, [id]);
      //release connection
      connection.release();
      return result.rows[0];
    } catch (error) {
      throw new Error(`Sorry unable to delete user ${id}.Error: ${error}`);
    }
  }
  //authenticate(login)
  async authenticate(
    identifier: string,
    password: string
  ): Promise<LoginUser | null> {
    try {
      const connection = await client.connect();
      const sql =
        'SELECT user_id, name, shop_name, password FROM users WHERE email = $1 or mobile = $1';

      const result = await connection.query(sql, [identifier]);

      connection.release();
      if (result.rows.length) {
        const resultUser = result.rows[0];
        return {
          name: resultUser.name,
          userId: resultUser.user_id,
          shopName: resultUser.shop_name,
          password: resultUser.password,
        };
      }
      return null;
    } catch (error) {
      throw new Error(`Login Error: ${error}`);
    }
  }

  async saveLoginToken(userId: string, token: string): Promise<null> {
    try {
      const connection = await client.connect();
      const sql =
        'INSERT INTO users_token ( user_id, token, created_at) VALUES ($1, $2, now())';

      await connection.query(sql, [userId, token]);

      connection.release();
      return null;
    } catch (error) {
      throw new Error(`Login save token Error: ${error}`);
    }
  }

  async getUserToken(token: string): Promise<User | null> {
    try {
      //open connection with database
      const connection = await client.connect();
      const sql = `SELECT user_id FROM users_token WHERE token = $1`;
      //run query
      const result = await connection.query(sql, [token]);
      //release connection
      connection.release();
      return result.rows.length ? result.rows[0].user_id : null;
    } catch (error) {
      throw new Error(
        `Sorry unable to get user token ${token}. Error: ${error}`
      );
    }
  }
}
