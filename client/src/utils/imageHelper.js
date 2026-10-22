// Если картинка начинается с /uploads, значит она лежит на сервере
export const getImageUrl = (url, fallback = 'https://placehold.co/150x150?text=Avatar') => {
  if (!url) return fallback;
  if (url.startsWith('/uploads')) {
    return `http://localhost:5000${url}`;
  }
  return url;
};