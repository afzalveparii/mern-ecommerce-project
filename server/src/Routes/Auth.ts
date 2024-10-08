import express from 'express';
import { authController } from '../Controllers/Auth';

import passport from 'passport';
import { uploadProfilePicture }  from '../multerconfig/storageConfig';

const router = express.Router();
//  /auth is already added in base path
router.post('/signup',uploadProfilePicture, authController.createUser)
.post('/login', passport.authenticate('local'), authController.loginUser)
.get('/check',passport.authenticate('jwt'), authController.checkAuth)
.get('/logout', authController.logout)
.post('/reset-password-request', authController.resetPasswordRequest)
.post('/reset-password', authController.resetPassword)

export { router };
