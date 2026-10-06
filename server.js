import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let products = [
  { id: 1, name: 'Смартфон Galaxy S23', description: 'Флагманский смартфон с AMOLED-экраном', manufacturer: 'Samsung', price: 79999 },
  { id: 2, name: 'Ноутбук MacBook Air M2', description: 'Тонкий и легкий ноутбук для работы', manufacturer: 'Apple', price: 119999 },
  { id: 3, name: 'Наушники WH-1000XM5', description: 'Беспроводные наушники с шумоподавлением', manufacturer: 'Sony', price: 34999 }
];

let nextId = 4;

// CRUD ==================

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: 'Продукт не найден' });
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const { name, description, manufacturer, price } = req.body;
  if (!name || !description || !manufacturer || price === undefined) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ message: 'Цена должна быть положительным числом' });
  }
  const newProduct = { id: nextId++, name, description, manufacturer, price };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ message: 'Продукт не найден' });

  const { name, description, manufacturer, price } = req.body;
  if (!name || !description || !manufacturer || price === undefined) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ message: 'Цена должна быть положительным числом' });
  }

  products[index] = { id, name, description, manufacturer, price };
  res.json(products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ message: 'Продукт не найден' });

  const deleted = products.splice(index, 1)[0];
  res.json({ message: 'Продукт удалён', product: deleted });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});

// npm run dev