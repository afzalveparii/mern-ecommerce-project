import express from 'express';
import { userController } from '../Controllers/User';

const router = express.Router();

// /users is already added in base path
router.get('/own', userController.fetchUserById)
      .patch('/:id', userController.updateUser)
      .delete('/:id', userController.deleteUser);

export { router };