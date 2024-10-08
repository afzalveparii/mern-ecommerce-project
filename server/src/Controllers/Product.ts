import { Request, Response } from 'express';
import { Product, IProduct } from '../models/Product';

class ProductController {
  async createProduct(req: Request, res: Response): Promise<void> {
    // this product we have to get from API body
    const product = new Product(req.body);
    product.discountPrice = Math.round(product.price * (1 - product.discountPercentage / 100));
    try {
      const doc: IProduct = await product.save();
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  // async createProduct(req: Request, res: Response): Promise<void> {
  //   try {
  //     const productData = req.body;

  //     // Handle uploaded images
  //     if (req.files && Array.isArray(req.files)) {
  //       productData.images = (req.files as Express.Multer.File[]).map(file => `/uploads/productImages/${file.filename}`);
  //     } else if (!productData.images) {
  //       productData.images = []; 
  //     }
  //     const product = new Product(productData);
  //     // Calculate discountPrice
  //     product.discountPrice = Math.round(product.price * (1 - product.discountPercentage / 100));
  //     const doc: IProduct = await product.save();
  //     res.status(201).json(doc);
  //   } catch (err) {
  //     console.error('Error creating product:', err);
  //     res.status(400).json(err);
  //   }
  // }

  async fetchAllProducts(req: Request, res: Response): Promise<void> {
    // filter = {"category":["smartphone","laptops"]}
    // sort = {_sort:"price",_order="desc"}
    // pagination = {_page:1,_limit=10}
    let condition: any = {};
    if (!req.query.admin) {
      condition.deleted = { $ne: true };
    }
    
    let query = Product.find(condition);
    let totalProductsQuery = Product.find(condition);

    console.log(req.query.category);

    if (req.query.category) {
      query = query.find({ category: { $in: (req.query.category as string).split(',') } });
      totalProductsQuery = totalProductsQuery.find({
        category: { $in: (req.query.category as string).split(',') },
      });
    }
    if (req.query.brand) {
      query = query.find({ brand: { $in: (req.query.brand as string).split(',') } });
      totalProductsQuery = totalProductsQuery.find({ brand: { $in: (req.query.brand as string).split(',') } });
    }
    // if (req.query._sort && req.query._order) {
    //   query = query.sort({ [req.query._sort as string]: req.query._order });
    // }
    if (typeof req.query._sort === 'string' && typeof req.query._order === 'string') {
      query = query.sort({ [req.query._sort]: req.query._order === 'asc' ? 1 : -1 });
    }

    const totalDocs = await totalProductsQuery.countDocuments().exec();
    console.log({ totalDocs });

    if (req.query._page && req.query._limit) {
      const pageSize = Number(req.query._limit);
      const page = Number(req.query._page);
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }

    try {
      const docs: IProduct[] = await query.exec();
      res.set('X-Total-Count', totalDocs.toString());
      res.status(200).json(docs);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async fetchProductById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const product: IProduct | null = await Product.findById(id);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
      res.status(200).json(product);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const product: IProduct | null = await Product.findByIdAndUpdate(id, req.body, { new: true });
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
      product.discountPrice = Math.round(product.price * (1 - product.discountPercentage / 100));
      const updatedProduct: IProduct = await product.save();
      res.status(200).json(updatedProduct);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const product: IProduct | null = await Product.findByIdAndDelete(id);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      res.status(400).json(err);
    }
  }
}

export const productController = new ProductController();