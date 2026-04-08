import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCteeftXledZI9is3jftXRAiHv10yd48Mo",
    authDomain: "matchnmeal-f69bc.firebaseapp.com",
    projectId: "matchnmeal-f69bc",
    storageBucket: "matchnmeal-f69bc.firebasestorage.app",
    messagingSenderId: "982378294902",
    appId: "1:982378294902:web:b6d142296f6af905b43957"
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