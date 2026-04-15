import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, addDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCteeftXledZI9is3jftXRAiHv10yd48Mo",
    authDomain: "matchnmeal-f69bc.firebaseapp.com",
    projectId: "matchnmeal-f69bc",
    storageBucket: "matchnmeal-f69bc.firebasestorage.app",
    messagingSenderId: "982378294902",
    appId: "1:982378294902:web:b6d142296f6af905b43957",
    measurementId: "G-3W37S47ZXF"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let userFavorites = [];
let allIngredients = [];
let allRecipes = {}; // Обектив с ID-та
let selectedIngredients = [];

// Проверка на потребителя при зареждане
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        
        // Показване на името
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            document.querySelector('.user-name-desktop').innerText = userDoc.data().displayName;
            userFavorites = userDoc.data().favorites || [];
        }

        // Ако е админ, показваме бутон за админ панел
        if(user.email === "admin@matchnmeal.com"){
             const adminBtn = document.createElement('a');
             adminBtn.href = "admin.html";
             adminBtn.className = "btn-secondary";
             adminBtn.style.marginLeft = "15px";
             adminBtn.innerText = "Админ Панел";
             document.querySelector('.user-profile').appendChild(adminBtn);
        }

        loadDataFromFirebase();
    } else {
        window.location.href = "login.html"; // Пренасочване, ако не е логнат
    }
});

// Зареждане на базите данни
async function loadDataFromFirebase() {
    // 1. Съставки
    const ingSnap = await getDocs(collection(db, "ingredients"));
    allIngredients = [];
    ingSnap.forEach(doc => allIngredients.push(doc.data().name));
    renderSidebar(allIngredients);

    // 2. Рецепти
    const recSnap = await getDocs(collection(db, "recipes"));
    allRecipes = {};
    recSnap.forEach(doc => {
        allRecipes[doc.id] = { id: doc.id, ...doc.data() };
    });
    
    renderRecipes();
    renderFavorites();
    renderCalendar(); // Остава същият от предишния код
}

// --- НАВИГАЦИЯ ---
window.switchView = function(viewId) {
    document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active-view'));
    document.getElementById(viewId).classList.add('active-view');

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// --- РЕНДЕРИРАНЕ НА КИЛЕР ---
function renderSidebar(items) {
    const sidebarContainer = document.getElementById('sidebar-ingredients');
    sidebarContainer.innerHTML = '';
    items.forEach(ing => {
        const btn = document.createElement('button');
        btn.className = selectedIngredients.includes(ing) ? 'ing-btn active' : 'ing-btn';
        btn.innerText = ing;
        btn.onclick = () => toggleIngredient(ing);
        sidebarContainer.appendChild(btn);
    });
}

window.toggleIngredient = function(name) {
    if (selectedIngredients.includes(name)) {
        selectedIngredients = selectedIngredients.filter(i => i !== name);
    } else {
        selectedIngredients.push(name);
    }
    renderSidebar(allIngredients);
}

// --- РЕНДЕРИРАНЕ НА РЕЦЕПТИ И ЛЮБИМИ ---
function createRecipeCardHTML(recipe, isFav) {
    const heartClass = isFav ? 'fa-solid' : 'fa-regular';
    const activeClass = isFav ? 'active' : '';

    return `
        <div class="recipe-card">
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
        </div>
    `;
}

function renderRecipes() {
    const grid = document.getElementById('recipe-grid-container');
    grid.innerHTML = '';
    Object.values(allRecipes).forEach(recipe => {
        const isFav = userFavorites.includes(recipe.id);
        grid.innerHTML += createRecipeCardHTML(recipe, isFav);
    });
}

function renderFavorites() {
    const grid = document.getElementById('favorites-grid-container');
    grid.innerHTML = '';
    if(userFavorites.length === 0) {
        grid.innerHTML = "<p>Все още нямате любими рецепти.</p>";
        return;
    }
    userFavorites.forEach(id => {
        if(allRecipes[id]) {
            grid.innerHTML += createRecipeCardHTML(allRecipes[id], true);
        }
    });
}

// --- ЛОГИКА ЗА ДОБАВЯНЕ В ЛЮБИМИ ---
window.toggleFavorite = async function(event, recipeId) {
    event.stopPropagation();
    const userRef = doc(db, "users", currentUser.uid);

    if (userFavorites.includes(recipeId)) {
        // Премахване
        userFavorites = userFavorites.filter(id => id !== recipeId);
        await updateDoc(userRef, { favorites: arrayRemove(recipeId) });
    } else {
        // Добавяне
        userFavorites.push(recipeId);
        await updateDoc(userRef, { favorites: arrayUnion(recipeId) });
    }

    // Обновяваме изгледите
    renderRecipes();
    renderFavorites();
}

// --- МОДАЛЕН ПРОЗОРЕЦ (Остава същият) ---
const modal = document.getElementById('recipe-modal');
window.openRecipeModal = function(recipeId) {
    const data = allRecipes[recipeId];
    if(!data) return;

    // Генерираш HTML за модала както в предишния отговор...
    const benefitsHtml = data.benefits.map(b => `<span class="b-tag">${b}</span>`).join('');
    const ingredientsHtml = data.ingredients.map(ing => `<li>${ing}</li>`).join('');
    const stepsHtml = data.steps.map((step, index) => `<li><strong>Стъпка ${index + 1}:</strong> ${step}</li>`).join('');

    document.getElementById('modal-body-content').innerHTML = `
        <div class="modal-header-img" style="background-image: url('${data.img}')">
            <div class="modal-title-box">
                <h2>${data.title}</h2>
            </div>
        </div>
        <div class="modal-details">
            <div class="detail-section"><h3>Съставки</h3><ul>${ingredientsHtml}</ul><div class="benefits-tags">${benefitsHtml}</div></div>
            <div class="detail-section"><h3>Приготвяне</h3><ul style="list-style-type: none; padding: 0;">${stepsHtml}</ul></div>
        </div>
    `;
    modal.style.display = "block";
}

document.querySelector('.close-modal').onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }

// Календар логиката (добави функцията renderCalendar от предишния отговор тук)
function renderCalendar() { /* ... */ }
window.toggleFilterMenu = function(event) { /* ... */ }

const newRecipes = [
  {
    "title": "Кето купа с тофу и броколи",
    "desc": "Бързо, засищащо и изцяло на растителна основа ястие, перфектно за лека вечеря.",
    "img": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "time": "20 мин",
    "calories": "350 kcal",
    "protein": "25g",
    "benefits": ["Веган", "Вегетарианско", "Без глутен", "Високо протеиново", "Нисковъглехидратно", "Кето"],
    "ingredients": ["200г твърдо тофу", "150г броколи", "2 с.л. соев сос без глутен", "1 с.л. сусамово олио", "1 скилидка чесън", "1 ч.л. сусам"],
    "steps": ["Отцедете добре тофуто и го нарежете на кубчета.", "Запържете тофуто в сусамово олио до златисто.", "Добавете броколите и чесъна, гответе 4-5 минути.", "Добавете соевия сос, разбъркайте и поръсете със сусам."]
  },
  {
    "title": "Пилешка кето купа с авокадо",
    "desc": "Балансирано и богато на мазнини ястие, идеално за кето режим.",
    "img": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
    "time": "25 мин",
    "calories": "420 kcal",
    "protein": "30g",
    "benefits": ["Без глутен", "Високо протеиново", "Нисковъглехидратно", "Кето"],
    "ingredients": ["200г пилешко филе", "1 авокадо", "100г спанак", "1 с.л. зехтин", "1 скилидка чесън", "сол и пипер"],
    "steps": [
      "Нарежете пилешкото и го овкусете.",
      "Запържете го в зехтин до готовност.",
      "Добавете чесъна и спанака за 2-3 минути.",
      "Сервирайте с нарязано авокадо."
    ]
  },
  {
    "title": "Салата с риба тон и яйца",
    "desc": "Лека, но засищаща салата, подходяща за бърз обяд.",
    "img": "https://images.unsplash.com/photo-1604908554165-2c9fefc4d4d3?auto=format&fit=crop&w=800&q=80",
    "time": "15 мин",
    "calories": "300 kcal",
    "protein": "28g",
    "benefits": ["Без глутен", "Високо протеиново", "Кето", "Нисковъглехидратно"],
    "ingredients": ["1 консерва риба тон", "2 сварени яйца", "100г зелена салата", "1 с.л. майонеза", "лимонов сок"],
    "steps": [
      "Отцедете рибата тон.",
      "Нарежете яйцата.",
      "Смесете всички съставки в купа.",
      "Подправете с майонеза и лимонов сок."
    ]
  },
  {
    "title": "Кето тиквички с пармезан",
    "desc": "Ароматно зеленчуково ястие с хрупкава коричка.",
    "img": "https://images.unsplash.com/photo-1605475128323-3d3a9c2c6c77?auto=format&fit=crop&w=800&q=80",
    "time": "20 мин",
    "calories": "250 kcal",
    "protein": "12g",
    "benefits": ["Вегетарианско", "Без глутен", "Кето", "Нисковъглехидратно"],
    "ingredients": ["2 тиквички", "50г пармезан", "1 с.л. зехтин", "чесън на прах", "сол"],
    "steps": [
      "Нарежете тиквичките на кръгчета.",
      "Подредете ги в тава и намажете със зехтин.",
      "Поръсете с пармезан и подправки.",
      "Печете 15 минути на 200°C."
    ]
  },
  {
    "title": "Омлет със спанак и сирене",
    "desc": "Класически омлет с добавени зелени и кремообразна текстура.",
    "img": "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80",
    "time": "10 мин",
    "calories": "270 kcal",
    "protein": "20g",
    "benefits": ["Вегетарианско", "Без глутен", "Кето", "Високо протеиново"],
    "ingredients": ["3 яйца", "50г сирене", "50г спанак", "1 ч.л. масло", "сол"],
    "steps": [
      "Разбийте яйцата.",
      "Запържете спанака в масло.",
      "Добавете яйцата и сиренето.",
      "Гответе до готовност."
    ]
  }
];

async function seedDatabase() {
    console.log("Започва добавяне на рецепти...");
    for (const recipe of newRecipes) {
        try {
            await addDoc(collection(db, "recipes"), recipe);
            console.log(`Успешно добавена: ${recipe.title}`);
        } catch (error) {
            console.error("Грешка при добавяне: ", error);
        }
    }
    console.log("Готово! Изтрий този временен код.");
}
// РАЗКОМЕНТИРАЙ ДОЛНИЯ РЕД САМО ЗА 1 СЕКУНДА, ЗА ДА СЕ ИЗПЪЛНИ ФУНКЦИЯТА:
// seedDatabase();

const profileToggle = document.getElementById('user-profile-toggle');
const profileDropdown = document.getElementById('profile-dropdown');
const dropdownLogoutBtn = document.getElementById('dropdown-logout-btn');

// Показване/скриване на менюто при клик върху името/снимката
if (profileToggle && profileDropdown) {
    profileToggle.addEventListener('click', (event) => {
        event.stopPropagation(); // Предотвратява затварянето веднага
        profileDropdown.classList.toggle('show');
    });
}

// Затваряне на менюто, ако кликнеш някъде другаде по екрана
window.addEventListener('click', (event) => {
    if (profileDropdown && profileDropdown.classList.contains('show')) {
        if (!profileToggle.contains(event.target)) {
            profileDropdown.classList.remove('show');
        }
    }
});

// Логика за бутона "Изход" от падащото меню
if (dropdownLogoutBtn) {
    dropdownLogoutBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Спира презареждането на страницата от линка

        signOut(auth).then(() => {
            localStorage.removeItem('user');
            window.location.href = "home.html";
        }).catch((error) => {
            alert("Възникна грешка при излизане: " + error.message);
        });
    });
}