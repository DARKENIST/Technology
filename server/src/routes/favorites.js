import { Router } from 'express';
import { Favorite, User, Category } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

// Получение списка товаров в избранном
router.get('/', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const favorites = await user.getFavorites({
      include: [{ model: Category, as: 'category' }]
    });
    res.json(favorites);
  } catch (e) {
    console.error('Ошибка при получении избранного:', e);
    res.status(500).json({ message: 'Ошибка получения избранного', error: e.message });
  }
});

// Получение ID товаров в избранном
router.get('/ids', async (req, res) => {
  try {
    const favorites = await Favorite.findAll({ 
      where: { user_id: req.user.id }, 
      attributes: ['product_id'] 
    });
    res.json(favorites.map(f => f.product_id));
  } catch (e) {
    console.error('Ошибка при получении ID избранного:', e);
    res.status(500).json({ message: 'Ошибка получения ID', error: e.message });
  }
});

// Добавление в избранное
router.post('/:productId', async (req, res) => {
  try {
    const exists = await Favorite.findOne({ 
      where: { user_id: req.user.id, product_id: req.params.productId } 
    });
    if (exists) {
      return res.status(400).json({ message: 'Товар уже в избранном' });
    }
    
    await Favorite.create({ user_id: req.user.id, product_id: req.params.productId });
    res.status(201).json({ message: 'Добавлено в избранное' });
  } catch (e) {
    console.error('Ошибка при добавлении в избранное:', e);
    res.status(500).json({ message: 'Ошибка добавления', error: e.message });
  }
});

// Удаление из избранного
router.delete('/:productId', async (req, res) => {
  try {
    await Favorite.destroy({ 
      where: { user_id: req.user.id, product_id: req.params.productId } 
    });
    res.json({ message: 'Удалено из избранного' });
  } catch (e) {
    console.error('Ошибка при удалении из избранного:', e);
    res.status(500).json({ message: 'Ошибка удаления', error: e.message });
  }
});

export default router;