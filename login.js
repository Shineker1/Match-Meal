import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

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

const login = document.getElementById("login");

login.addEventListener("click", function (event) {
    event.preventDefault();
    
    // input fields for login
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredentials) => {
        const user = userCredentials.user;

        // Store user info in session/local storage
        localStorage.setItem("user", JSON.stringify({ uid:user.uid, email: user.email}));

        // Redirect to profile page
        window.location.href = "main.html";
    })
    .catch((error) => {
        const errorMessage = error.message;
        alert('Login failed: ${errorMessage}')
    })
});