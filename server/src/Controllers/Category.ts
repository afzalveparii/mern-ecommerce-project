import { Request, Response } from 'express';
import { Category, ICategory } from '../models/Category';

class CategoryController {
  async fetchCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories: ICategory[] = await Category.find({}).exec();
      res.status(200).json(categories);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    const category = new Category(req.body);
    try {
      const doc: ICategory = await category.save();
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json(err);
    }
  }
}

export const categoryController = new CategoryController();