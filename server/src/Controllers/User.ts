import { Request, Response } from 'express';
import { Category } from "../models/Category";
import { User, IUser } from '../models/User';

class UserController {
  async fetchUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.user as IUser;
    console.log(id);
    try {
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json({
        name: user.name,
        id: user.id,
        addresses: user.addresses,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      });
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const user = await User.findByIdAndUpdate(id, req.body, { new: true });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(400).json(err);
    }
  }
}

export const userController = new UserController();