import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Проверяем, существует ли папка uploads, если нет - создаем
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Настраиваем хранилище
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir); // Сохраняем в папку uploads
  },
  filename: (req, file, cb) => {
    // Делаем уникальное имя: текущее время + оригинальное расширение (например, 171628394.jpg)
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Фильтр по типу файла (только картинки)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Лимит 5 МБ
});

// Маршрут загрузки одного файла (поле называется 'image')
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Файл не загружен' });
  }
  
  // Возвращаем путь к файлу, чтобы сохранить его в БД
  res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;