import { Request, Response } from 'express';
import { Brand, IBrand } from '../models/Brand';

class BrandController {
  async fetchBrands(req: Request, res: Response): Promise<void> {
    try {
      const brands: IBrand[] = await Brand.find({}).exec();
      res.status(200).json(brands);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async createBrand(req: Request, res: Response): Promise<void> {
    const brand = new Brand(req.body);
    try {
      const doc: IBrand = await brand.save();
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json(err);
    }
  }
}

export const brandController = new BrandController();