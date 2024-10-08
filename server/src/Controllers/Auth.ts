import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { commonService } from '../services/common';

class AuthController {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const salt = crypto.randomBytes(16);

      crypto.pbkdf2(
        req.body.password,
        salt,
        310000,
        32,
        'sha256',
        async (err: Error | null, hashedPassword: Buffer) => {
          if (err) {
            res.status(400).json(err);
            return;
          }
          // Handle profile picture
          let profilePicture = '';
          if (req.file) {
            profilePicture = req.file.filename;
            console.log('Profile picture filename:', profilePicture);
          }
          const user = new User({ ...req.body, password: hashedPassword, salt, profilePicture });
          const doc = await user.save();

          req.login(commonService.sanitizeUser(doc), (err) => {
            if (err) {
              res.status(400).json(err);
            } else {
              const token = jwt.sign(
                commonService.sanitizeUser(doc),
                process.env.JWT_SECRET_KEY as string
              );
              res
                .cookie('jwt', token, {
                  expires: new Date(Date.now() + 3600000),
                  httpOnly: true,
                })
                .status(201)
                .json({ id: doc.id, role: doc.role, profilePicture: profilePicture });
            }
          });
        }
      );
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    const user = req.user as IUser & { token: string };
    res
      .cookie('jwt', user.token, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
      })
      .status(201)
      .json({ id: user.id, role: user.role });
  }

  async logout(req: Request, res: Response): Promise<void> {
    res
      .cookie('jwt', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .sendStatus(200);
  }

  async checkAuth(req: Request, res: Response): Promise<void> {
    if (req.user) {
      res.json(req.user);
    } else {
      res.sendStatus(401);
    }
  }

  async resetPasswordRequest(req: Request, res: Response): Promise<void> {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (user) {
      const token = crypto.randomBytes(48).toString('hex');
      user.resetPasswordToken = token;
      await user.save();

      const resetPageLink =
        'http://localhost:3000/reset-password?token=' + token + '&email=' + email;
      const subject = 'reset password for e-commerce';
      const html = `<p>Click <a href='${resetPageLink}'>here</a> to Reset Password</p>`;

      if (email) {
        const response = await commonService.sendMail({ to: email, subject, html });
        res.json(response);
      } else {
        res.sendStatus(400);
      }
    } else {
      res.sendStatus(400);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, password, token } = req.body;

    const user = await User.findOne({ email: email, resetPasswordToken: token });
    if (user) {
      const salt = crypto.randomBytes(16);
      crypto.pbkdf2(
        password,
        salt,
        310000,
        32,
        'sha256',
        async (err: Error | null, hashedPassword: Buffer) => {
          if (err) {
            res.status(400).json(err);
            return;
          }
          user.password = hashedPassword;
          user.salt = salt;
          await user.save();
          const subject = 'password successfully reset for e-commerce';
          const html = `<p>Successfully able to Reset Password</p>`;
          if (email) {
            const response = await commonService.sendMail({ to: email, subject, html });
            res.json(response);
          } else {
            res.sendStatus(400);
          }
        }
      );
    } else {
      res.sendStatus(400);
    }
  }
}

export const authController = new AuthController();