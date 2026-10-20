import { Router } from 'express';
import { Op } from 'sequelize';
import { Product, Category, User } from '../models/index.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

// Публичный каталог с фильтрами
router.get('/', async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, condition, search, sort } = req.query;
    const where = {};

    if (category)  where.category_id = category;
    if (brand)     where.brand = brand;
    if (condition) where.condition = condition;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
      ];
    }

    let order = [['created_at', 'DESC']];
    if (sort === 'price_asc')  order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];

    const products = await Product.findAll({
      where,
      order,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name'] },
      ],
    });

    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка получения товаров', error: e.message });
  }
});

// Один товар
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'city', 'avatar_url'] },
      ],
    });
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    res.json(product);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// Создание (только продавец)
router.post('/', auth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const { title, description, brand, price, condition, category_id, image_url, stock, seller_id } = req.body;
    if (!title || !price || !category_id)
      return res.status(400).json({ message: 'Заполните обязательные поля' });

    // Если это админ и он выбрал продавца, берем seller_id из запроса. Иначе - текущий пользователь.
    const assignedSellerId = (req.user.role === 'admin' && seller_id) ? seller_id : req.user.id;

    const product = await Product.create({
      seller_id: assignedSellerId,
      category_id, title, description, brand,
      price, condition: condition || 'new',
      image_url, stock: stock || 1,
    });

    res.status(201).json(product);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка создания товара', error: e.message });
  }
});

// Обновление
router.put('/:id', auth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });

    if (product.seller_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Нет прав' });

    const fields = ['title', 'description', 'brand', 'price', 'condition', 'category_id', 'image_url', 'stock'];
    fields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });

    await product.save();
    res.json(product);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка обновления', error: e.message });
  }
});

// Удаление
router.delete('/:id', auth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    if (product.seller_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Нет прав' });

    await product.destroy();
    res.json({ message: 'Товар удалён' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка удаления', error: e.message });
  }
});

export default router;