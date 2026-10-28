export const getImageUrl = (url, fallback = 'https://placehold.co/150x150?text=Avatar') => {
  if (!url) return fallback;
  
  // Если ссылка уже полная (с http/https), возвращаем как есть
  if (url.startsWith('http')) {
    return url;
  }
  
  // Если это старые локальные картинки (начинаются с /uploads)
  if (url.startsWith('/uploads')) {
    // Если мы в разработке (localhost), добавляем адрес сервера
    if (window.location.hostname === 'localhost') {
      return `http://localhost:5000${url}`;
    }
    // В продакшене (Render) такие картинки уже не загрузятся, так как папка пуста
    return fallback; 
  }
  
  return url;
};