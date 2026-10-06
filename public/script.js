//Конфигурация
const API = '/api/products';

//Элементы DOM
const catalogEl = document.getElementById('catalog');
const emptyMessage = document.getElementById('emptyMessage');
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const form = document.getElementById('productForm');
const toastEl = document.getElementById('toast');

const fields = {
  id: document.getElementById('productId'),
  name: document.getElementById('name'),
  description: document.getElementById('description'),
  manufacturer: document.getElementById('manufacturer'),
  price: document.getElementById('price'),
};

//Загрузка и отрисовка товаров
async function loadProducts() {
  try {
    const res = await fetch(API);
    const products = await res.json();
    renderProducts(products);
  } catch (err) {
    showToast('Ошибка загрузки товаров');
    console.error(err);
  }
}

function renderProducts(products) {
  catalogEl.innerHTML = '';

  if (products.length === 0) {
    emptyMessage.classList.remove('hidden');
    return;
  }
  emptyMessage.classList.add('hidden');

  products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card__manufacturer">${escapeHtml(p.manufacturer)}</div>
      <h3 class="card__name">${escapeHtml(p.name)}</h3>
      <p class="card__description">${escapeHtml(p.description)}</p>
      <div class="card__price">${formatPrice(p.price)} ₽</div>
      <div class="card__actions">
        <button class="btn btn--ghost" data-action="edit">✏️ Изменить</button>
        <button class="btn btn--danger" data-action="delete">🗑 Удалить</button>
      </div>
    `;

    card.querySelector('[data-action="edit"]')
      .addEventListener('click', () => openEdit(p));
    card.querySelector('[data-action="delete"]')
      .addEventListener('click', () => deleteProduct(p));

    catalogEl.appendChild(card);
  });
}

// Модальное окно
function openModal(title) {
  modalTitle.textContent = title;
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  form.reset();
  fields.id.value = '';
}

function openCreate() {
  form.reset();
  fields.id.value = '';
  openModal('Добавить товар');
  fields.name.focus();
}

function openEdit(product) {
  fields.id.value = product.id;
  fields.name.value = product.name;
  fields.description.value = product.description;
  fields.manufacturer.value = product.manufacturer;
  fields.price.value = product.price;
  openModal('Редактировать товар');
  fields.name.focus();
}

// Отправка формы
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: fields.name.value.trim(),
    description: fields.description.value.trim(),
    manufacturer: fields.manufacturer.value.trim(),
    price: Number(fields.price.value),
  };

  const id = fields.id.value;
  const isEdit = Boolean(id);

  try {
    const res = await fetch(isEdit ? `${API}/${id}` : API, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || 'Ошибка сохранения');
      return;
    }

    showToast(isEdit ? 'Товар обновлён ✅' : 'Товар добавлен ✅');
    closeModal();
    loadProducts();
  } catch (err) {
    showToast('Ошибка сети');
    console.error(err);
  }
});

// Удаление 
async function deleteProduct(product) {
  if (!confirm(`Удалить товар «${product.name}»?`)) return;

  try {
    const res = await fetch(`${API}/${product.id}`, { method: 'DELETE' });
    if (!res.ok) {
      showToast('Не удалось удалить товар');
      return;
    }
    showToast('Товар удалён 🗑');
    loadProducts();
  } catch (err) {
    showToast('Ошибка сети');
    console.error(err);
  }
}

// Вспомогательные 
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatPrice(num) {
  return new Intl.NumberFormat('ru-RU').format(num);
}

let toastTimer;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 2500);
}

// Слушатели 
addBtn.addEventListener('click', openCreate);

modal.querySelectorAll('[data-close]').forEach(el => {
  el.addEventListener('click', closeModal);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
});

// Старт 
loadProducts();