import { Request, Response, NextFunction } from 'express';
import { ProductModel } from '../../endpoint/models/product.row.model';

//instance from the ProductModel class
const productModel = new ProductModel();

//create a product
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productModel.create(req.body);
    res.json({
      data: product,
      message: 'done.. product created',
    });
  } catch (error) {
    next(error);
  }
};

//select all products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productModel.getAllProducts();
    res.json({
      data: product,
      message: 'done.. recieved all products',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: String(error),
    });
  }
};

//select specific product
export const getCompatibleProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await productModel.getCompatibleProducts(
      req.params.id as unknown as string
    );
    const compatibleProducts = products.reduce((acc, item) => {
      const key = item.categoryId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, typeof products>);
    res.json({
      data: compatibleProducts,
      message: 'done.. product recieved',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: String(error),
    });
  }
};

//delete product
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productModel.deleteProduct(
      req.params.id as unknown as number
    );
    res.json({
      data: product,
      message: 'done.. product deleted',
    });
  } catch (error) {
    next(error);
  }
};
