import express from 'express';
import { brandController } from '../Controllers/Brand';

const router = express.Router();
//  /brands is already added in base path
router.get('/', brandController.fetchBrands).post('/', brandController.createBrand);


export { router };
