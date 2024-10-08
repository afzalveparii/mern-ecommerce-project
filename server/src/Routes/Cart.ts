import express from 'express';
import { cartController } from '../Controllers/Cart';

const router = express.Router();
//  /products is already added in base path
router.post('/', cartController.addToCart)
      .get('/', cartController.fetchCartByUser)
      .delete('/:id', cartController.deleteFromCart)
      .patch('/:id', cartController.updateCart)


export { router };
