import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Проверка валидности JWT-токена
export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Нет токена авторизации' });

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Неверный или истекший токен' });
  }
}

// Проверка роли пользователя
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещен: недостаточно прав' });
    }
    next();
  };
}