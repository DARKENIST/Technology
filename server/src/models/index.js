import { User } from './user.js';
import { Category } from './category.js';
import { Device } from './device.js';
import { Product } from './product.js';
import { RepairRequest } from './repairRequest.js';
import { Review } from './review.js';
import { Order } from './order.js';
import { OrderItem } from './orderItem.js';
import { Favorite } from './favorite.js';

// Связи: Пользователи и Товары
User.hasMany(Product, { foreignKey: 'seller_id', as: 'products' });
Product.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

// Связи: Категории и Товары
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Связи: Категории и Устройства
Category.hasMany(Device, { foreignKey: 'category_id', as: 'devices' });
Device.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Связи: Заявки на ремонт
User.hasMany(RepairRequest, { foreignKey: 'buyer_id', as: 'buyerRequests' });
User.hasMany(RepairRequest, { foreignKey: 'master_id', as: 'masterRequests' });
RepairRequest.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });
RepairRequest.belongsTo(User, { foreignKey: 'master_id', as: 'master' });

Device.hasMany(RepairRequest, { foreignKey: 'device_id', as: 'repairRequests' });
RepairRequest.belongsTo(Device, { foreignKey: 'device_id', as: 'device' });

// Связи: Отзывы
User.hasMany(Review, { foreignKey: 'author_id', as: 'writtenReviews' });
User.hasMany(Review, { foreignKey: 'target_user_id', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
Review.belongsTo(User, { foreignKey: 'target_user_id', as: 'target' });

Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Связи: Заказы
User.hasMany(Order, { foreignKey: 'buyer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasMany(OrderItem, { foreignKey: 'seller_id', as: 'soldItems' });
OrderItem.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

// Связи: Избранное (многие-ко-многим)
User.belongsToMany(Product, { through: Favorite, as: 'favorites', foreignKey: 'user_id' });
Product.belongsToMany(User, { through: Favorite, as: 'favoritedBy', foreignKey: 'product_id' });

export { 
  User, 
  Category, 
  Device, 
  Product, 
  RepairRequest, 
  Review, 
  Order, 
  OrderItem, 
  Favorite 
};