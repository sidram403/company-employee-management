import express from 'express';
import { auth, adminOnly } from '../middleware/auth.middleware.js';
import { 
  createEmployee, 
  updateEmployee, 
  deleteEmployee, 
  searchEmployees, 
  getEmployeeById
} from '../controllers/employee.controller.js';

const router = express.Router();

router.post('/', auth, adminOnly, createEmployee);

router.put('/:id', auth, adminOnly, updateEmployee);

router.delete('/:id', auth, adminOnly, deleteEmployee);

router.get('/search', auth, searchEmployees);

router.get('/:id', auth, getEmployeeById);

export default router;

