import { Router } from 'express';
import { Device, Category } from '../models/index.js';

const router = Router();

router.get('/', async (req, res) => {
  const { category } = req.query;
  const where = {};
  if (category) where.category_id = category;

  const items = await Device.findAll({
    where,
    include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    order: [['brand', 'ASC'], ['model', 'ASC']],
  });
  res.json(items);
});

export default router;