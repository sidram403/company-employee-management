import express from 'express';
import { auth, adminOnly } from '../middleware/auth.middleware.js';
import { createCompany, updateCompany, getCompanies, deleteCompany } from '../controllers/company.controller.js';

const router = express.Router();

router.post('/', auth, adminOnly, createCompany);
router.put('/:id', auth, adminOnly, updateCompany);
router.delete('/:id', auth, adminOnly, deleteCompany);
router.get('/', auth, getCompanies);

export default router;

