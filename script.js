// Import all the necessary Firebase functions
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDGY9k-IEouh7-2zZ2UdkK2XMGityN9r9A",
    authDomain: "quicktalk-c7486.firebaseapp.com",
    projectId: "quicktalk-c7486",
    storageBucket: "quicktalk-c7486.firebasestorage.app",
    messagingSenderId: "343153380167",
    appId: "1:343153380167:web:49c50664eb6a078a76da62",
    measurementId: "G-H8H3K6GGGQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get references to HTML elements
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginBtn');
const signUpButton = document.getElementById('signUpBtn');

// Event listener for the Login button
loginButton.addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            console.log("Login successful.");
            window.location.href = "chat.html";
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.error("Login failed:", errorMessage);
            alert(`Login failed: ${errorMessage}`);
        });
});

// Event listener for the Sign Up button
signUpButton.addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            // Save username in Firestore
            await setDoc(doc(db, "users", user.uid), {
                username: email.split('@')[0],
                email: email
            });

            console.log("User signed up and username saved.");
            alert("Account created successfully!");
            window.location.href = "chat.html"; // Redirect to the chat page
        })
        .catch((error) => {
            console.error("Sign up failed:", error.message);
            alert(`Sign up failed: ${error.message}`);
        });
});