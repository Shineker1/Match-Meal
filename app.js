// --- Data ---
const ingredientsList = [
    "Chicken Breast", "Eggs", "Milk", "Cheese", "Butter", 
    "Spinach", "Tomatoes", "Onion", "Garlic", "Pasta", 
    "Rice", "Potatoes", "Carrots", "Peppers", "Ground Beef"
];

// --- Elements ---
const sidebarContainer = document.getElementById('sidebar-ingredients');
const searchInput = document.getElementById('ingredient-search');
const matchCount = document.getElementById('match-count');

let selectedIngredients = [];

// --- Init ---
function init() {
    renderSidebar(ingredientsList);
}

// --- Render Sidebar List ---
function renderSidebar(items) {
    sidebarContainer.innerHTML = '';
    
    items.forEach(ing => {
        const itemDiv = document.createElement('div');
        itemDiv.className = selectedIngredients.includes(ing) ? 'ing-item active' : 'ing-item';
        itemDiv.innerHTML = `
            ${ing} 
            <i class="fa-solid fa-check check-icon"></i>
        `;
        itemDiv.onclick = () => toggleIngredient(ing);
        sidebarContainer.appendChild(itemDiv);
    });
}

// --- Toggle Logic ---
function toggleIngredient(name) {
    if (selectedIngredients.includes(name)) {
        selectedIngredients = selectedIngredients.filter(i => i !== name);
    } else {
        selectedIngredients.push(name);
    }
    
    // Re-render to show active state
    // (In a real React/Vue app this would be more efficient, but this works for vanilla JS)
    const currentSearch = searchInput.value.toLowerCase();
    const filtered = ingredientsList.filter(item => item.toLowerCase().includes(currentSearch));
    renderSidebar(filtered);

    // Update result count text mock
    if(selectedIngredients.length > 0) {
        matchCount.innerText = `${selectedIngredients.length} Ingredients Selected`;
    } else {
        matchCount.innerText = "Select ingredients to match recipes";
    }
}

// --- Search Filter Logic ---
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = ingredientsList.filter(item => item.toLowerCase().includes(term));
    renderSidebar(filtered);
});


// --- Modal Logic (Same as before) ---
const modal = document.getElementById('recipe-modal');
const closeModal = document.querySelector('.close-modal');
const modalBody = document.querySelector('.modal-body');

const recipeDetails = {
    'creamy-pasta': {
        title: "Creamy Spinach Chicken Pasta",
        img: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80",
        time: "25 mins",
        calories: "450 kcal",
        ingredients: ["Chicken Breast", "Spinach", "Pasta", "Heavy Cream", "Garlic", "Parmesan"],
        steps: ["Boil pasta.", "Cook chicken.", "Add cream and spinach.", "Combine."],
        nutrition: { p: "32g", f: "18g", c: "45g"}
    },
    'omelette': {
        title: "Classic Cheese Omelette",
        img: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80",
        time: "10 mins",
        calories: "280 kcal",
        ingredients: ["Eggs", "Cheese", "Butter"],
        steps: ["Whisk eggs.", "Cook in butter.", "Add cheese and fold."],
        nutrition: { p: "18g", f: "22g", c: "3g"}
    }
};

function openRecipeModal(recipeId) {
    const data = recipeDetails[recipeId];
    if(!data) return;

    // (Simplified modal content for brevity, reuse previous detailed HTML if desired)
    modalBody.innerHTML = `
        <div class="modal-img" style="background-image: url('${data.img}')"></div>
        <div style="padding: 20px;">
            <h2>${data.title}</h2>
            <p><strong>Ingredients:</strong> ${data.ingredients.join(', ')}</p>
            <p style="margin-top:10px">${data.steps.join(' ')}</p>
        </div>
    `;
    modal.style.display = "block";
}

closeModal.onclick = function() { modal.style.display = "none"; }
window.onclick = function(event) { if (event.target == modal) modal.style.display = "none"; }

// Start
init();