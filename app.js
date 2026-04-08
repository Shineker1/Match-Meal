// --- Данни ---
const ingredientsList = [
    "Пилешки гърди", "Яйца", "Мляко", "Сирене", "Масло", 
    "Спанак", "Домати", "Лук", "Чесън", "Паста", 
    "Ориз", "Картофи", "Моркови", "Чушки", "Кайма",
    "Зехтин", "Босилек", "Гъби", "Сметана", "Пармезан"
];

const recipeDetails = {
    'creamy-pasta': {
        id: 'creamy-pasta',
        title: "Кремообразна паста с пиле и спанак",
        desc: "Бърза и вкусна паста, използваща наличните ви продукти.",
        img: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80",
        time: "25 мин",
        calories: "450 kcal",
        protein: "32г",
        ingredients: ["Пилешки гърди", "Спанак", "Паста", "Сметана", "Чесън", "Пармезан"],
        steps: ["Сварете пастата в подсолена вода.", "Запържете пилето с чесъна.", "Добавете сметаната и спанака да къкри.", "Смесете всичко и поръсете с пармезан."],
        benefits: ["Високо протеиново", "Източник на желязо"],
        isFavorite: false
    },
    'omelette': {
        id: 'omelette',
        title: "Класически омлет със сирене",
        desc: "Пухкави яйца с разтопено сирене. Перфектната бърза закуска.",
        img: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80",
        time: "10 мин",
        calories: "280 kcal",
        protein: "18г",
        ingredients: ["Яйца", "Сирене", "Масло"],
        steps: ["Разбийте яйцата добре.", "Разтопете маслото в тиган.", "Изсипете яйцата, добавете сиренето и сгънете на две."],
        benefits: ["Кето", "Без глутен", "Бързо"],
        isFavorite: true
    }
};

// --- Елементи ---
const sidebarContainer = document.getElementById('sidebar-ingredients');
const searchInput = document.getElementById('ingredient-search');
const matchCount = document.getElementById('match-count');
const recipeGrid = document.getElementById('recipe-grid-container');
const calendarGrid = document.getElementById('calendar-grid');

let selectedIngredients = [];

// --- Инициализация ---
function init() {
    renderSidebar(ingredientsList);
    renderCalendar();
    renderRecipes();
}

// --- Навигация между табовете ---
window.switchView = function(viewId) {
    // Скриваме всички изгледи
    document.querySelectorAll('.app-view').forEach(view => {
        view.classList.remove('active-view');
    });
    // Показваме избрания
    document.getElementById(viewId).classList.add('active-view');

    // Обновяваме стила на бутоните
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Намираме кой бутон е натиснат (този, който е извикал функцията)
    event.currentTarget.classList.add('active');
}

// --- Падащо меню за Филтри ---
window.toggleFilterMenu = function(event) {
    const wrapper = document.getElementById('filter-wrapper');
    wrapper.classList.toggle('open');
    event.stopPropagation(); // Спира клика, за да не се затвори веднага
}

// Затваряне на филтрите при клик другаде
document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('filter-wrapper');
    if (wrapper.classList.contains('open') && !wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
    }
});

// --- Календар (Седмичен планьор) ---
function renderCalendar() {
    const days = ["Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя"];
    calendarGrid.innerHTML = '';

    days.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.innerHTML = `
            <h4>${day}</h4>
            <div class="meal-slot"><span>Закуска</span> <i class="fa-solid fa-plus"></i></div>
            <div class="meal-slot"><span>Обяд</span> <i class="fa-solid fa-plus"></i></div>
            <div class="meal-slot"><span>Вечеря</span> <i class="fa-solid fa-plus"></i></div>
        `;
        calendarGrid.appendChild(dayCard);
    });
}

// --- Рендериране на килера (Тагове) ---
function renderSidebar(items) {
    sidebarContainer.innerHTML = '';
    items.forEach(ing => {
        const btn = document.createElement('button');
        btn.className = selectedIngredients.includes(ing) ? 'ing-btn active' : 'ing-btn';
        btn.innerText = ing;
        btn.onclick = () => toggleIngredient(ing);
        sidebarContainer.appendChild(btn);
    });
}

// --- Логика за избор на съставки ---
function toggleIngredient(name) {
    if (selectedIngredients.includes(name)) {
        selectedIngredients = selectedIngredients.filter(i => i !== name);
    } else {
        selectedIngredients.push(name);
    }
    
    const currentSearch = searchInput.value.toLowerCase();
    const filtered = ingredientsList.filter(item => item.toLowerCase().includes(currentSearch));
    renderSidebar(filtered);

    if(selectedIngredients.length > 0) {
        matchCount.innerText = `Открити 2 рецепти на базата на вашите продукти`;
    } else {
        matchCount.innerText = "Избери продукти, за да видиш рецепти";
    }
}

// --- Търсачка за съставки ---
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = ingredientsList.filter(item => item.toLowerCase().includes(term));
    renderSidebar(filtered);
});

// --- Рендериране на рецептите ---
function renderRecipes() {
    recipeGrid.innerHTML = '';
    
    Object.values(recipeDetails).forEach(recipe => {
        const heartClass = recipe.isFavorite ? 'fa-solid' : 'fa-regular';
        const activeClass = recipe.isFavorite ? 'active' : '';

        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <button class="fav-btn ${activeClass}" onclick="toggleFavorite(event, '${recipe.id}')">
                <i class="${heartClass} fa-heart"></i>
            </button>
            
            <div class="recipe-img" style="background-image: url('${recipe.img}');" onclick="openRecipeModal('${recipe.id}')">
                <span class="time-badge"><i class="fa-regular fa-clock"></i> ${recipe.time}</span>
            </div>
            
            <div class="recipe-content" onclick="openRecipeModal('${recipe.id}')">
                <h3>${recipe.title}</h3>
                <p class="recipe-desc">${recipe.desc}</p>
                <div class="recipe-stats">
                    <div><i class="fa-solid fa-fire"></i> ${recipe.calories}</div>
                    <div><i class="fa-solid fa-dumbbell"></i> ${recipe.protein}</div>
                </div>
            </div>
        `;
        recipeGrid.appendChild(card);
    });
}

// --- Логика за Любими ---
window.toggleFavorite = function(event, recipeId) {
    event.stopPropagation(); 
    const recipe = recipeDetails[recipeId];
    recipe.isFavorite = !recipe.isFavorite; 
    renderRecipes(); 
}

// --- Модален Прозорец ---
const modal = document.getElementById('recipe-modal');
const closeModal = document.querySelector('.close-modal');
const modalBody = document.getElementById('modal-body-content');

window.openRecipeModal = function(recipeId) {
    const data = recipeDetails[recipeId];
    if(!data) return;

    const benefitsHtml = data.benefits.map(b => `<span class="b-tag">${b}</span>`).join('');
    const ingredientsHtml = data.ingredients.map(ing => `<li>${ing}</li>`).join('');
    const stepsHtml = data.steps.map((step, index) => `<li><strong>Стъпка ${index + 1}:</strong> ${step}</li>`).join('');

    modalBody.innerHTML = `
        <div class="modal-header-img" style="background-image: url('${data.img}')">
            <div class="modal-title-box">
                <h2>${data.title}</h2>
                <span class="time-badge" style="position: static; display: inline-block;"><i class="fa-regular fa-clock"></i> ${data.time}</span>
            </div>
        </div>
        <div class="modal-details">
            <div class="detail-section">
                <h3><i class="fa-solid fa-basket-shopping"></i> Необходими съставки</h3>
                <ul>${ingredientsHtml}</ul>
                
                <h3 style="margin-top: 25px;"><i class="fa-solid fa-leaf"></i> Ползи & Диети</h3>
                <div class="benefits-tags">
                    ${benefitsHtml}
                </div>
            </div>
            <div class="detail-section">
                <h3><i class="fa-solid fa-list-ol"></i> Начин на приготвяне</h3>
                <ul style="list-style-type: none; padding: 0; display: flex; flex-direction: column; gap: 10px;">${stepsHtml}</ul>
            </div>
        </div>
    `;
    modal.style.display = "block";
}

closeModal.onclick = function() { modal.style.display = "none"; }
window.onclick = function(event) { if (event.target == modal) modal.style.display = "none"; }

document.addEventListener('DOMContentLoaded', init);