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

const form = document.getElementById("login-form");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Prevent empty submissions
    if (!email || !password) {
        return; // do nothing if fields are empty
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredentials) => {
            const user = userCredentials.user;

            localStorage.setItem("user", JSON.stringify({
                uid: user.uid,
                email: user.email
            }));

            window.location.href = "main.html";
        })
        .catch((error) => {
            alert(`Login failed: ${error.message}`);
        });
});