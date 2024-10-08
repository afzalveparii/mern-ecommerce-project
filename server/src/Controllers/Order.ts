import { Request, Response } from 'express';
import { Order, IOrder } from '../models/Order';
import { Product, IProduct } from '../models/Product';
import { User, IUser } from '../models/User';
import { commonService } from '../services/common';

class OrderController {
  async fetchOrdersByUser(req: Request, res: Response): Promise<void> {
    const { id } = req.user as IUser;
    try {
      const orders: IOrder[] = await Order.find({ user: id });
      res.status(200).json(orders);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    const order = new Order(req.body);
    
    for (let item of order.items) {
      let product: IProduct | null = await Product.findOne({ _id: item.product.id });
      if (!product) {
        res.status(400).json({ message: "Product not found" });
        return;
      }
      product.$inc('stock', -1 * item.quantity);
      if (product.stock < 0) {
        res.status(400).json({ message: "Stock is less than required" });
        return;
      }
      await product.save();
    }

    try {
      const doc: IOrder = await order.save();
      const user: IUser | null = await User.findById(order.user);
      if (user) {
        // sendMail({to: user.email, html: invoiceTemplate(order), subject: 'Order Received'});
      }
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async deleteOrder(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const order: IOrder | null = await Order.findByIdAndDelete(id);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.status(200).json(order);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async updateOrder(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const order: IOrder | null = await Order.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.status(200).json(order);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async fetchAllOrders(req: Request, res: Response): Promise<void> {
    let query = Order.find({ deleted: { $ne: true } });
    let totalOrdersQuery = Order.find({ deleted: { $ne: true } });

    // if (req.query._sort && req.query._order) {
    //   query = query.sort({ [req.query._sort as string]: req.query._order });
    // }
    if (typeof req.query._sort === 'string' && typeof req.query._order === 'string') {
      query = query.sort({ [req.query._sort]: req.query._order === 'asc' ? 1 : -1 });
    }

    const totalDocs = await totalOrdersQuery.countDocuments().exec();

    if (req.query._page && req.query._limit) {
      const pageSize = Number(req.query._limit);
      const page = Number(req.query._page);
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }

    try {
      const docs: IOrder[] = await query.exec();
      res.set('X-Total-Count', totalDocs.toString());
      res.status(200).json(docs);
    } catch (err) {
      res.status(400).json(err);
    }
  }
}

export const orderController = new OrderController();