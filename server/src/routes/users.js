import { Router } from 'express';
import { User, Product, Review, Category } from '../models/index.js';

const router = Router();

// Получение базовой информации о продавце
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'first_name', 'last_name', 'middle_name', 'city', 'avatar_url', 'role', 'created_at']
    });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// Получение товаров конкретного продавца
router.get('/:id/products', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { seller_id: req.params.id },
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(products);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// Получение отзывов о продавце
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { target_user_id: req.params.id },
      include: [
        { model: User, as: 'author', attributes: ['first_name', 'last_name', 'avatar_url'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

export default router;