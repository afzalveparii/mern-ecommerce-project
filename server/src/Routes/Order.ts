import express from 'express';
import { orderController } from '../Controllers/Order';

const router = express.Router();
//  /orders is already added in base path
router.post('/', orderController.createOrder)
      .get('/own/', orderController.fetchOrdersByUser)
      .delete('/:id', orderController.deleteOrder)
      .patch('/:id', orderController.updateOrder)
      .get('/',orderController.fetchAllOrders)

export { router };


