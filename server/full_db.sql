CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'buyer',
    avatar_url VARCHAR(255),
    phone VARCHAR(20),
    bio TEXT,
    city VARCHAR(80),
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    blocked_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT users_role_check CHECK (role IN ('buyer', 'seller', 'master', 'admin'))
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(120) NOT NULL,
    release_year INTEGER,
    CONSTRAINT devices_unique_model UNIQUE (brand, model)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    brand VARCHAR(80),
    price NUMERIC(10,2) NOT NULL,
    condition VARCHAR(10) NOT NULL DEFAULT 'new',
    image_url VARCHAR(255),
    stock INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT products_condition_check CHECK (condition IN ('new', 'used'))
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'card',
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT orders_status_check CHECK (status IN ('new', 'paid', 'shipped', 'delivered', 'canceled'))
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(10,2) NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK (quantity > 0)
);

CREATE TABLE repair_requests (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    master_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    price NUMERIC(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT repair_status_check CHECK (status IN ('new', 'in_progress', 'diagnostics', 'approved', 'repairing', 'done', 'canceled'))
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Заполнение тестовыми данными (пароль 123456)
INSERT INTO users (last_name, first_name, middle_name, email, password_hash, role, city) VALUES
('Админов', 'Александр', 'Сергеевич', 'admin@tech.ru', '$2b$10$5qfTsJukHW6rQ.Lh.2apge6EOvxOIXjupoq9RM7CQlJf4q9rUS4mW', 'admin', 'Москва'),
('Иванов', 'Иван', 'Петрович', 'ivan@tech.ru', '$2b$10$5qfTsJukHW6rQ.Lh.2apge6EOvxOIXjupoq9RM7CQlJf4q9rUS4mW', 'buyer', 'Санкт-Петербург'),
('Смирнов', 'Олег', 'Игоревич', 'shop@tech.ru', '$2b$10$5qfTsJukHW6rQ.Lh.2apge6EOvxOIXjupoq9RM7CQlJf4q9rUS4mW', 'seller', 'Новосибирск'),
('Морозов', 'Алексей', 'Николаевич', 'alex@tech.ru', '$2b$10$5qfTsJukHW6rQ.Lh.2apge6EOvxOIXjupoq9RM7CQlJf4q9rUS4mW', 'master', 'Москва');

INSERT INTO categories (name, slug) VALUES
('Смартфоны', 'smartphones'),
('Ноутбуки', 'laptops'),
('Планшеты', 'tablets');

INSERT INTO devices (category_id, brand, model, release_year) VALUES
(1, 'Apple', 'iPhone 13', 2021),
(1, 'Samsung', 'Galaxy S22', 2022),
(2, 'ASUS', 'ROG Strix G15', 2021);

INSERT INTO products (seller_id, category_id, title, description, brand, price, condition, stock) VALUES
(3, 1, 'iPhone 13 128Gb', 'Отличное состояние', 'Apple', 48990, 'used', 1),
(3, 2, 'ASUS ROG Strix G15', 'Игровой ноутбук', 'ASUS', 85000, 'used', 1),
(3, 3, 'Xiaomi Pad 5', 'Отличный планшет', 'Xiaomi', 27000, 'used', 1);