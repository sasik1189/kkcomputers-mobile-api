import client from '../database_connect';

/* CRUD actions for the Prodect table */
//define the Typescript type for user table
export type Product = {
  productId: string;
  name: string;
  price?: number;
  categoryId: string;
  compatibleId: string;
  compatibleName: string;
};

export type CompatibleProduct = {
  categoryId: string;
  compatibleId: string;
  compatibleName: string;
};

export type CompatibleProductObj = {
  category: string;
  list: Array<CompatibleProduct>;
};

//This class is going to be the representation of the database (postgres ambassador in js)
export class ProductModel {
  //create a new product
  // the method needs to be asynchronous because all calls to the database will be promises
  async create(p: Product): Promise<Product> {
    try {
      //open connection with database
      const connection = await client.connect();
      const sql =
        'INSERT INTO products (name, price) VALUES($1, $2) RETURNING *';
      //run query
      const result = await connection.query(sql, [p.name, p.price]);
      //release connection
      connection.release();
      //return created product
      return result.rows[0];
    } catch (error) {
      throw new Error(
        `Sorry unable to create a new product ${p.name}.Error: ${error}`
      );
    }
  }
  //get all products
  async getAllProducts(type: string): Promise<Product[]> {
    try {
      //open connection with database
      const connection = await client.connect();
      const sql = `SELECT product_id "productId", name FROM products WHERE type = $1 order by name asc`;
      //run query
      const result = await connection.query(sql, [type]);
      //release connection
      connection.release();
      //return all products
      return result.rows;
    } catch (error) {
      throw new Error(`Sorry unable to find products.Error: ${error}`);
    }
  }
  //get specific product
  async getCompatibleProducts(id: string): Promise<CompatibleProduct[]> {
    try {
      //open connection with database
      const connection = await client.connect();
      const sql = `(select cp.compatible_id "compatibleId", p.name "compatibleName", cp.category_id "categoryId" from compatible_products cp 
        JOIN products p on cp.compatible_id = p.product_id
        where cp.product_id = $1)
        UNION
        (select cp.product_id "compatibleId", p.name "compatibleName", cp.category_id "categoryId" from compatible_products cp 
        JOIN products p on cp.product_id = p.product_id
        where cp.compatible_id = $1)`;
      //run query
      const result = await connection.query(sql, [id]);
      //release connection
      connection.release();
      return result.rows;
    } catch (error) {
      throw new Error(`Sorry unable to  product ${id}.Error: ${error}`);
    }
  }
  //delete a product
  async deleteProduct(id: number): Promise<Product> {
    try {
      //open connection with database
      const connection = await client.connect();
      const sql = `DELETE FROM products WHERE id= $1 RETURNING id`;
      //run query
      const result = await connection.query(sql, [id]);
      //release connection
      connection.release();
      return result.rows[0];
    } catch (error) {
      throw new Error(`Sorry unable to delete product ${id}.Error: ${error}`);
    }
  }
}
