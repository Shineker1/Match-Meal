  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
  import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";

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
  const db = getFirestore(app)
  const analytics = getAnalytics(app);  2

const submit = document.getElementById("submit");

submit.addEventListener('click', function(event){
  event.preventDefault();

const username = document.getElementById("username").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    setDoc(doc(db, "users", user.uid), {
      email: user.email,
      displayName : username,
    }).then(() =>{
      window.location.href = "login.html"
    });
  })
  .catch((error) => {
    const errorMessage = error.message;
    alert(errorMessage)
  });
});
