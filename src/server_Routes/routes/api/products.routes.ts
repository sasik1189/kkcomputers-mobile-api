import { Router } from 'express';
import * as controllers from '../../controllers/product.controllers';
import {
  verifyAuthToken,
  verifySubscription,
} from '../../../middleware/authToken';

//invoke fn Router
const productsRoutes = Router();

//to create a new product, token required
// productsRoutes.post('/', verifyAuthToken, controllers.create);
productsRoutes.get('/:type', verifyAuthToken, controllers.getAllProducts);
productsRoutes.get(
  '/compatibles/:id',
  verifyAuthToken,
  verifySubscription,
  controllers.getCompatibleProducts
);
// productsRoutes.delete('/:id', controllers.deleteProduct);

export default productsRoutes;
