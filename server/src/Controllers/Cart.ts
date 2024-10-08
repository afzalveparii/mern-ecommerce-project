import { Request, Response } from 'express';
import { Cart, ICart } from '../models/Cart';
import { IUser } from '../models/User';

class CartController {
  async fetchCartByUser(req: Request, res: Response): Promise<void> {
    const { id } = req.user as IUser;
    try {
      const cartItems: ICart[] = await Cart.find({ user: id }).populate('product');
      res.status(200).json(cartItems);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async addToCart(req: Request, res: Response): Promise<void> {
    const { id } = req.user as IUser;
    const cart = new Cart({ ...req.body, user: id });
    try {
      const doc = await cart.save();
      const result = await doc.populate('product');
      // if (result.quantity > result.product.stock) {
      //   res.status(400).json({ message: "Stock is less than required" });
      //   return;
      // }
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async deleteFromCart(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await Cart.findByIdAndDelete(id);
      res.status(200).json({ message: 'Item removed from cart' });
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async updateCart(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const cart = await Cart.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!cart) {
        res.status(404).json({ message: 'Cart item not found' });
        return;
      }
      const result = await cart.populate('product');
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json(err);
    }
  }
}

export const cartController = new CartController();