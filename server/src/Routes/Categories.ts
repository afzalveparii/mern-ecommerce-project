import express from 'express';
import { categoryController } from '../Controllers/Category';

const router = express.Router();
//  /categories is already added in base path

router.get('/', categoryController.fetchCategories).post('/', categoryController.createCategory)

export { router };
