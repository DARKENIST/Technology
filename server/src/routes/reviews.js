import { Router } from 'express';
import { Review, User, Product } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Получить отзывы для конкретного товара
router.get('/product/:productId', async (req, res) => {
  const reviews = await Review.findAll({
    where: { product_id: req.params.productId },
    include: [{ model: User, as: 'author', attributes: ['last_name', 'first_name', 'avatar_url'] }],
    order: [['created_at', 'DESC']]
  });
  res.json(reviews);
});

// Оставить отзыв
router.post('/', auth, async (req, res) => {
  try {
    const { product_id, target_user_id, rating, comment } = req.body;
    
    // Проверка, не оставлял ли уже этот пользователь отзыв на этот товар
    const exists = await Review.findOne({ where: { author_id: req.user.id, product_id } });
    if (exists) return res.status(400).json({ message: 'Вы уже оставляли отзыв на этот товар' });

    const review = await Review.create({
      author_id: req.user.id,
      target_user_id,
      product_id,
      rating,
      comment
    });
    res.status(201).json(review);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

export default router;