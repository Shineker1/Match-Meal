import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

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
let userPlanner = {}; // Структура за календара
let allIngredients = [];
let allRecipes = {}; 
let selectedIngredients = [];

// Проверка на потребителя при зареждане
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            document.querySelector('.user-name-desktop').innerHTML = `${userDoc.data().displayName} <i class="fa-solid fa-chevron-down" style="font-size: 0.8rem;"></i>`;
            userFavorites = userDoc.data().favorites || [];
            userPlanner = userDoc.data().planner || {}; 
        }

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
        window.location.href = "login.html";
    }
});

async function loadDataFromFirebase() {
    const ingSnap = await getDocs(collection(db, "ingredients"));
    allIngredients = [];
    ingSnap.forEach(doc => allIngredients.push(doc.data().name));
    renderSidebar(allIngredients);

    const recSnap = await getDocs(collection(db, "recipes"));
    allRecipes = {};
    recSnap.forEach(doc => {
        allRecipes[doc.id] = { id: doc.id, ...doc.data() };
    });
    
    window.renderRecipes();
    renderFavorites();
    renderCalendar(); 
}

// --- НАВИГАЦИЯ И ИЗГЛЕДИ ---
window.switchView = function(event, viewId) {
    document.querySelectorAll('.app-view').forEach(view => view.style.display = 'none');

    const targetView = document.getElementById(viewId);
    if (targetView) targetView.style.display = 'block';

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// --- КИЛЕР И ТЪРСЕНЕ ---
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
    window.renderRecipes(); 
}

// --- ФИЛТРИ И РЕЦЕПТИ ---
window.toggleFilterMenu = function(event) {
    event.stopPropagation();
    document.getElementById('filter-wrapper').classList.toggle('open');
}

window.addEventListener('click', (e) => {
    const wrapper = document.getElementById('filter-wrapper');
    if (wrapper && !wrapper.contains(e.target) && !e.target.classList.contains('filter-toggle')) {
        wrapper.classList.remove('open');
    }
});

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

window.renderRecipes = function() {
    const grid = document.getElementById('recipe-grid-container');
    const matchCountEl = document.getElementById('match-count'); 
    grid.innerHTML = '';
   
    let recipesToDisplay = Object.values(allRecipes);

    // Филтриране по съставки
    if (selectedIngredients.length > 0) {
        recipesToDisplay = recipesToDisplay.filter(recipe => {
            return selectedIngredients.every(selectedIng => {
                return recipe.ingredients.some(recipeIng =>
                    recipeIng.toLowerCase().includes(selectedIng.toLowerCase())
                );
            });
        });
    }

    // Филтриране по тагове (Веган, Без Глутен и т.н.)
    const checkboxes = document.querySelectorAll('#filter-dropdown input[type="checkbox"]');
    const activeFilters = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);

    if (activeFilters.length > 0) {
        recipesToDisplay = recipesToDisplay.filter(recipe => {
            if(!recipe.benefits) return false;
            return activeFilters.every(filter => recipe.benefits.includes(filter));
        });
    }

    if(matchCountEl) matchCountEl.innerText = selectedIngredients.length > 0 || activeFilters.length > 0 ? `Намерени: ${recipesToDisplay.length}` : 'Всички рецепти';

    if(recipesToDisplay.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1 / -1; text-align: center; color: #666; font-size: 1.1rem; padding: 40px;'>Няма намерени рецепти с тези критерии.</p>";
        return;
    }

    recipesToDisplay.forEach(recipe => {
        const isFav = userFavorites.includes(recipe.id);
        grid.innerHTML += createRecipeCardHTML(recipe, isFav);
    });
}

window.renderFavorites = function() {
    const grid = document.getElementById('favorites-grid-container');
    if(!grid) return;
    grid.innerHTML = '';
    
    if(userFavorites.length === 0) {
        grid.innerHTML = "<p style='text-align: center; width: 100%; color: #666; margin-top: 30px;'>Все още нямате любими рецепти.</p>";
        return;
    }
    userFavorites.forEach(id => {
        if(allRecipes[id]) {
            grid.innerHTML += createRecipeCardHTML(allRecipes[id], true);
        }
    });
}

// --- ЛЮБИМИ CRUD ---
window.toggleFavorite = async function(event, recipeId) {
    event.stopPropagation();
    const userRef = doc(db, "users", currentUser.uid);

    if (userFavorites.includes(recipeId)) {
        userFavorites = userFavorites.filter(id => id !== recipeId);
        await updateDoc(userRef, { favorites: arrayRemove(recipeId) });
    } else {
        userFavorites.push(recipeId);
        await updateDoc(userRef, { favorites: arrayUnion(recipeId) });
    }

    window.renderRecipes();
    renderFavorites();
}

// --- СЕДМИЧЕН ПЛАНЬОР (MEAL PLANNER) ---
const daysOfWeek = ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя'];
const mealTypes = ['Закуска', 'Обяд', 'Вечеря'];
let activePlannerDay = null;
let activePlannerMeal = null;

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if(!grid) return;
    grid.innerHTML = '';

    daysOfWeek.forEach(day => {
        let dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.innerHTML = `<h4>${day}</h4>`;

        mealTypes.forEach(meal => {
            const recipeId = userPlanner[day] && userPlanner[day][meal] ? userPlanner[day][meal] : null;
            const recipe = recipeId ? allRecipes[recipeId] : null;
            
            const slot = document.createElement('div');
            slot.className = 'meal-slot';
            slot.onclick = () => window.openPlannerModal(day, meal);
            
            if (recipe) {
                slot.style.borderColor = 'var(--primary-green)';
                slot.style.background = 'rgba(58, 128, 40, 0.05)';
                slot.innerHTML = `
                    <div style="display:flex; flex-direction:column; width: 100%;">
                        <span style="font-size: 0.75rem; color: var(--text-light); text-transform: uppercase; margin-bottom: 5px;">${meal}</span>
                        <span style="font-weight: 700; color: var(--primary-green); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${recipe.title}</span>
                    </div>
                `;
            } else {
                slot.innerHTML = `
                    <div style="display:flex; flex-direction:column; width: 100%;">
                        <span style="font-size: 0.75rem; color: var(--text-light); text-transform: uppercase; margin-bottom: 5px;">${meal}</span>
                        <span style="display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-plus"></i> Добави</span>
                    </div>
                `;
            }
            dayCard.appendChild(slot);
        });
        grid.appendChild(dayCard);
    });
}

window.openPlannerModal = function(day, meal) {
    activePlannerDay = day;
    activePlannerMeal = meal;
    const list = document.getElementById('planner-favorites-list');
    list.innerHTML = '';

    if (userFavorites.length === 0) {
        list.innerHTML = '<p style="text-align:center; color: #666; padding: 20px;">Нямате запазени любими рецепти за добавяне.</p>';
    } else {
        userFavorites.forEach(id => {
            const recipe = allRecipes[id];
            if (recipe) {
                list.innerHTML += `
                    <div style="display:flex; align-items:center; gap: 15px; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; cursor:pointer;" class="planner-item" onclick="selectRecipeForSlot('${id}')">
                        <img src="${recipe.img}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                        <span style="font-weight: 600;">${recipe.title}</span>
                    </div>
                `;
            }
        });
    }
    document.getElementById('planner-modal').style.display = 'block';
}

window.selectRecipeForSlot = async function(recipeId) {
    if (!userPlanner[activePlannerDay]) userPlanner[activePlannerDay] = {};
    userPlanner[activePlannerDay][activePlannerMeal] = recipeId;
    
    await updateDoc(doc(db, "users", currentUser.uid), { planner: userPlanner });
    renderCalendar();
    window.closeModal('planner-modal');
}

window.clearPlannerSlot = async function() {
    if (userPlanner[activePlannerDay] && userPlanner[activePlannerDay][activePlannerMeal]) {
        delete userPlanner[activePlannerDay][activePlannerMeal];
        await updateDoc(doc(db, "users", currentUser.uid), { planner: userPlanner });
    }
    renderCalendar();
    window.closeModal('planner-modal');
}

// --- МОДАЛИ И НАСТРОЙКИ ---
window.closeModal = function(modalId) {
    document.getElementById(modalId).style.display = "none";
}

window.openRecipeModal = function(recipeId) {
    const data = allRecipes[recipeId];
    if(!data) return;

    const benefitsHtml = data.benefits ? data.benefits.map(b => `<span class="b-tag">${b}</span>`).join('') : '';
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
            <div class="detail-section"><h3>Приготвяне</h3><ul style="list-style-type: none; padding: 0; gap:10px; display:flex; flex-direction:column;">${stepsHtml}</ul></div>
        </div>
    `;
    document.getElementById('recipe-modal').style.display = "block";
}

window.openSettingsModal = function() {
    document.getElementById('settings-name').value = currentUser.displayName || "";
    document.getElementById('settings-modal').style.display = "block";
    document.getElementById('profile-dropdown').classList.remove('show');
}

window.saveSettings = async function() {
    const newName = document.getElementById('settings-name').value;
    try {
        await updateProfile(currentUser, { displayName: newName });
        await updateDoc(doc(db, "users", currentUser.uid), { displayName: newName });
        document.querySelector('.user-name-desktop').innerHTML = `${newName} <i class="fa-solid fa-chevron-down" style="font-size: 0.8rem;"></i>`;
        window.closeModal('settings-modal');
        alert("Промените са запазени успешно!");
    } catch (e) {
        alert("Грешка при запазване: " + e.message);
    }
}

// Затваряне на модали при клик извън тях
window.onclick = (e) => { 
    if (e.target.classList.contains('modal')) e.target.style.display = "none"; 
}

// ПРОФИЛ ПАДАЩО МЕНЮ
const profileToggle = document.getElementById('user-profile-toggle');
const profileDropdown = document.getElementById('profile-dropdown');
const dropdownLogoutBtn = document.getElementById('dropdown-logout-btn');

if (profileToggle && profileDropdown) {
    profileToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        profileDropdown.classList.toggle('show');
    });
}

window.addEventListener('click', (event) => {
    if (profileDropdown && profileDropdown.classList.contains('show')) {
        if (!profileToggle.contains(event.target)) profileDropdown.classList.remove('show');
    }
});

if (dropdownLogoutBtn) {
    dropdownLogoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        
        signOut(auth).then(() => {
            localStorage.removeItem('user'); 
            
            window.location.href = "home.html";
        }).catch((error) => {
            alert("Възникна грешка при излизане: " + error.message);
        });
    });
}

const ingredientSearchInput = document.getElementById('ingredient-search');
if (ingredientSearchInput) {
    ingredientSearchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        const filteredIngredients = allIngredients.filter(ingredient => 
            ingredient.toLowerCase().includes(searchTerm)
        );
        renderSidebar(filteredIngredients);
    });
}