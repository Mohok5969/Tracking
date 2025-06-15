// Mock getCurrentUser() function to simulate logged-in user
function getCurrentUser() {
  return 'demoUser';
}

// Your existing JS code below, replace the import line with the above function

const defaultCategories = [
    { name: 'Drink', icon: '☕', color: 'bg-cat-blue' },
    { name: 'Food', icon: '🍔', color: 'bg-cat-green' },
    { name: 'Shopping', icon: '🛍️', color: 'bg-cat-yellow' },
    { name: 'Moto-bike', icon: '🏍️', color: 'bg-cat-purple' },
    { name: 'Taxi', icon: '🚕', color: 'bg-cat-red' },
    { name: 'Study', icon: '📚', color: 'bg-cat-indigo' },
    { name: 'Sport', icon: '🏅', color: 'bg-cat-teal' },
    { name: 'Rent-Room', icon: '🏠', color: 'bg-cat-orange' },
    { name: 'Skincare', icon: '🧴', color: 'bg-cat-pink' },
];

const emojiIcons = ['☕','🍔','🛍️','🏍️','🚕','📚','🏠','🏅','🧴'];
const user = getCurrentUser();
  
// Global data cache
let expenses = [];
let categories = [];

// --- Shared Functions ---
export function showToast(msg, type = 'success') {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast show';
  toast.classList.remove('bg-green-500', 'bg-red-500', 'bg-blue-500');
  if (type === 'success') {
    toast.style.backgroundColor = '#16a34a'; // green
  } else if (type === 'error') {
    toast.style.backgroundColor = '#dc2626'; // red
  } else {
    toast.style.backgroundColor = '#3b82f6'; // blue
  }
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// FIX: This function now loads category data itself, so it works on any page.
export function getCategoryDetails(categoryName) {
  if (categories.length === 0 && user) {
    const storedCategories = JSON.parse(localStorage.getItem(`${user}_categories`) || '[]');
    if (storedCategories.length > 0) {
      categories = storedCategories;
    } else {
      categories = defaultCategories;
    }
  }

  if (!categoryName || categoryName === 'Uncategorized') {
    return { icon: '📁', color: 'bg-gray-200 text-gray-800' };
  }
  const foundCategory = categories.find(cat => cat.name === categoryName);
  if (foundCategory) {
      return { icon: foundCategory.icon, color: foundCategory.color };
  }
  return { icon: '❓', color: 'bg-gray-200 text-gray-800' };
}

// --- Main script execution ---
document.addEventListener("DOMContentLoaded", () => {
  // This check ensures this code only runs on home.html
  const addExpenseBtn = document.getElementById('add-expense-btn');
  if (!addExpenseBtn) {
    return;
  }

  // --- Element Selectors ---
  const expenseDateInput = document.getElementById("expense-date");
  const categorySelect = document.getElementById("expense-category");
  const totalAmountDisplay = document.getElementById("total-expenses");
  const categoryList = document.getElementById("existing-categories");
  const currentMonthDisplay = document.getElementById("current-month-display");
  const newCategoryNameInput = document.getElementById("new-category-name");
  const addCategoryBtn = document.getElementById("add-category-btn");
  const selectedCategoryIcon = document.getElementById("selected-category-icon");

  // --- Load data from Local Storage ---
  expenses = JSON.parse(localStorage.getItem(`${user}_expenses`)) || [];
  categories = JSON.parse(localStorage.getItem(`${user}_categories`)) || [];
  if (categories.length === 0) {
      categories = [...defaultCategories];
      localStorage.setItem(`${user}_categories`, JSON.stringify(categories));
  }

  // --- Functions specific to home.html ---
  const saveExpenses = () => localStorage.setItem(`${user}_expenses`, JSON.stringify(expenses));
  const saveCategories = () => localStorage.setItem(`${user}_categories`, JSON.stringify(categories));

  function updateSelectedCategoryIcon() {
    const selectedCategoryName = categorySelect.value;
    const details = getCategoryDetails(selectedCategoryName);
    selectedCategoryIcon.textContent = details ? details.icon : '';
  }

  function updateTotal() {
    const now = new Date();
    const monthlyTotal = expenses.reduce((sum, e) => {
      const expenseDate = new Date(e.date);
      if (expenseDate.getFullYear() === now.getFullYear() && expenseDate.getMonth() === now.getMonth()) {
        return sum + Number(e.amount);
      }
      return sum;
    }, 0);
    totalAmountDisplay.textContent = `$${monthlyTotal.toFixed(2)}`;
    currentMonthDisplay.textContent = `For ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
  }

  function renderCategories() {
    const categoryOptions = categories.map(cat => `<option value="${cat.name}">${cat.icon} ${cat.name}</option>`).join('');
    categorySelect.innerHTML = '<option value="">Select Category</option>' + categoryOptions;

    if (categorySelect.options.length > 1) categorySelect.selectedIndex = 1;
    updateSelectedCategoryIcon();

    const categoryTags = categories.map((cat, index) => `
      <span class="px-3 py-1 ${cat.color} rounded-full text-sm flex items-center category-tag">
        ${cat.icon} <span class="ml-1">${cat.name}</span>
        <button class="ml-2 text-gray-700 hover:text-red-700 delete-category-btn" data-index="${index}" title="Delete category">&times;</button>
      </span>`).join('');
    categoryList.innerHTML = categoryTags || '<p class="text-gray-500 text-sm">No categories added yet.</p>';
    attachCategoryEventListeners();
  }

  function setTodaysDate() {
    expenseDateInput.value = new Date().toISOString().split('T')[0];
  }

  function attachCategoryEventListeners() {
    document.querySelectorAll(".delete-category-btn").forEach(button => {
      button.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        const categoryToDelete = categories[index];
        if (expenses.some(exp => exp.category === categoryToDelete.name)) {
          if (!confirm(`Category "${categoryToDelete.name}" has expenses. Are you sure you want to delete it?`)) return;
          expenses = expenses.map(exp => exp.category === categoryToDelete.name ? { ...exp, category: 'Uncategorized' } : exp);
          saveExpenses();
        }
        categories.splice(index, 1);
        saveCategories();
        renderCategories();
        updateTotal();
        showToast(`Category "${categoryToDelete.name}" deleted!`, 'success');
      });
    });
  }

  addCategoryBtn.addEventListener("click", () => {
    const name = newCategoryNameInput.value.trim();
    if (!name) return showToast("Please enter a category name.", 'error');
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) return showToast("Category already exists.", 'error');
    
    const matchedDefault = defaultCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
    const newCategory = matchedDefault ? { ...matchedDefault, name } : {
      name: name,
      icon: emojiIcons[Math.floor(Math.random() * emojiIcons.length)],
      color: ['bg-cat-blue', 'bg-cat-green', 'bg-cat-yellow', 'bg-cat-purple', 'bg-cat-red', 'bg-cat-indigo', 'bg-cat-teal', 'bg-cat-orange', 'bg-cat-pink'][Math.floor(Math.random() * 9)]
    };
    categories.push(newCategory);
    saveCategories();
    renderCategories();
    newCategoryNameInput.value = "";
    showToast("Category added successfully!", 'success');
  });

  addExpenseBtn.addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("expense-amount").value);
    const category = categorySelect.value;
    const date = expenseDateInput.value;
    const description = document.getElementById("expense-description").value.trim();
    if (isNaN(amount) || amount <= 0 || !category || !date) return showToast("Please fill all required fields.", 'error');

    expenses.push({ amount, category, date, description });
    saveExpenses();
    updateTotal();
    showToast("Expense added successfully!", 'success');
    
    document.getElementById("expense-amount").value = "";
    document.getElementById("expense-description").value = "";
    if (categorySelect.options.length > 1) categorySelect.selectedIndex = 1;
    updateSelectedCategoryIcon();
  });

  categorySelect.addEventListener('change', updateSelectedCategoryIcon);

  // --- Initial Page Load ---
  setTodaysDate();
  updateTotal();
  renderCategories();
});
