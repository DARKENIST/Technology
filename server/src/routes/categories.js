import { Router } from 'express';
import { Category } from '../models/index.js';

const router = Router();

router.get('/', async (req, res) => {
  const items = await Category.findAll({ order: [['name', 'ASC']] });
  res.json(items);
});

export default router;