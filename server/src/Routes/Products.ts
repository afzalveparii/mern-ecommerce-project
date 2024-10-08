import express from 'express';
import { productController } from '../Controllers/Product';
// import { uploadProductImages }  from '../multerconfig/storageConfig';
const router = express.Router();

// /products is already added in base path
router.post('/',   productController.createProduct)
      .get('/', productController.fetchAllProducts)
      .get('/:id', productController.fetchProductById)
      .patch('/:id', productController.updateProduct)
      .delete('/:id', productController.deleteProduct);

export { router };