import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

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

const ADMIN_EMAIL = "admin@matchnmeal.com"; 

// Проверка за достъп
onAuthStateChanged(auth, (user) => {
    console.log("AUTH STATE:", user);
    const authStatus = document.getElementById("auth-status");
    const adminContent = document.getElementById("admin-content");
    const logoutBtn = document.getElementById("logout-btn");

   if (user) {
    console.log("Logged in as:", user.email);

    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        authStatus.style.display = "none";
        adminContent.style.display = "block";
        logoutBtn.style.display = "block";

        loadIngredients();
        loadRecipes();
    } else {
        authStatus.innerHTML = `
            <h2>Нямаш админ права</h2>
            <p>Влязъл си като: ${user.email}</p>
        `;
    }
    } else {
        // Отказан достъп
        authStatus.innerHTML = `
            <i class="fa-solid fa-lock" style="font-size: 3rem; color: #ff4757; margin-bottom: 15px;"></i>
            <h2>Достъпът е отказан</h2>
            <p>Този панел е само за администратори. Моля, влезте с правилния акаунт.</p>
            <br>
            <a href="login.html" class="btn-primary">Към страницата за вход</a>
        `;
    }
});

// Изход
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        // Добавяме и тук изчистването
        localStorage.removeItem('user');
        window.location.href = "login.html";
    });
});

// --- СЪСТАВКИ CRUD ---
async function loadIngredients() {
    const list = document.getElementById('ingredients-list');
    list.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, "ingredients"));
    querySnapshot.forEach((docSnap) => {
        const item = docSnap.data();
        list.innerHTML += `
            <div class="item-row">
                <span><strong>${item.name}</strong></span> 
                <button class="btn-danger" onclick="deleteIngredient('${docSnap.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>`;
    });
}

document.getElementById('add-ingredient-btn').addEventListener('click', async () => {
    const name = document.getElementById('new-ingredient').value.trim();
    if (name) {
        await addDoc(collection(db, "ingredients"), { name });
        document.getElementById('new-ingredient').value = '';
        loadIngredients();
    } else {
        alert("Моля, въведете име на съставка.");
    }
});

window.deleteIngredient = async (id) => {
    if(confirm("Сигурни ли сте, че искате да изтриете тази съставка?")) {
        await deleteDoc(doc(db, "ingredients", id));
        loadIngredients();
    }
};

// --- РЕЦЕПТИ CRUD ---
async function loadRecipes() {
    const list = document.getElementById('recipes-list');
    list.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, "recipes"));
    querySnapshot.forEach((docSnap) => {
        const item = docSnap.data();
        list.innerHTML += `
            <div class="item-row">
                <span><strong>${item.title}</strong> (${item.time})</span> 
                <button class="btn-danger" onclick="deleteRecipe('${docSnap.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>`;
    });
}

document.getElementById('add-recipe-btn').addEventListener('click', async () => {
    const title = document.getElementById('r-title').value;
    if (!title) {
        alert("Моля, въведете поне заглавие!");
        return;
    }

    const recipeData = {
        title: title,
        desc: document.getElementById('r-desc').value,
        img: document.getElementById('r-img').value,
        time: document.getElementById('r-time').value,
        calories: document.getElementById('r-cal').value,
        protein: document.getElementById('r-pro').value,
        ingredients: document.getElementById('r-ingredients').value.split(',').map(s => s.trim()).filter(s => s !== ""),
        steps: document.getElementById('r-steps').value.split(',').map(s => s.trim()).filter(s => s !== ""),
        benefits: document.getElementById('r-benefits').value.split(',').map(s => s.trim()).filter(s => s !== ""),
    };

    try {
        await addDoc(collection(db, "recipes"), recipeData);
        alert("Успешно добавена рецепта!");
        
        // Изчистване на формата
        document.querySelectorAll('.admin-form input, .admin-form textarea').forEach(el => el.value = '');
        
        loadRecipes();
    } catch (e) {
        alert("Грешка при запис в базата: " + e.message);
    }
});

window.deleteRecipe = async (id) => {
    if(confirm("Сигурни ли сте, че искате да изтриете тази рецепта?")) {
        await deleteDoc(doc(db, "recipes", id));
        loadRecipes();
    }
};