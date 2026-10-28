CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  stock INT NOT NULL CHECK (stock >= 0)
);
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'PLACED'
);
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO products(name,price,stock)
SELECT 'Laptop',55000,10 WHERE NOT EXISTS (SELECT 1 FROM products);
INSERT INTO products(name,price,stock)
SELECT 'Keyboard',1500,25 WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Keyboard');
INSERT INTO products(name,price,stock)
SELECT 'Mouse',800,30 WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Mouse');
