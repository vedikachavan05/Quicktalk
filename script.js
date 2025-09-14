
  // Import the functions you need from the SDKs you need
  import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
  const analytics = getAnalytics(app);


  const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginBtn');
const signUpButton = document.getElementById('signUpBtn'); // Assuming you have a Sign Up button with this ID

  loginButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevents the form from submitting and reloading the page

    const email = emailInput.value;
    const password = passwordInput.value;
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Login was successful
            const user = userCredential.user;
            console.log("Login successful:", user);
            alert("Login successful!");
            // Here, you would redirect the user to the chat page
            // window.location.href = "chat.html";
        })
        .catch((error) => {
            // An error occurred during login
            const errorMessage = error.message;
            console.error("Login failed:", errorMessage);
            alert(`Login failed: ${errorMessage}`);
        });
});

signUpButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevents page reload

    const email = emailInput.value;
    const password = passwordInput.value;
    const auth = getAuth();

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Sign-up was successful
            const user = userCredential.user;
            console.log("Sign up successful:", user);
            alert("Account created successfully!");
            // You can also automatically log the user in here
        })
        .catch((error) => {
            // An error occurred during sign-up
            const errorMessage = error.message;
            console.error("Sign up failed:", errorMessage);
            alert(`Sign up failed: ${errorMessage}`);
        });
});

