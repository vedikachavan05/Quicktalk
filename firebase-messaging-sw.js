// Scripts for Firebase and Firebase Messaging
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js');

// Initialize the Firebase app
const firebaseConfig = {
    apiKey: "AIzaSyDGY9k-IEouh7-2zZ2UdkK2XMGityN9r9A",
    authDomain: "quicktalk-c7486.firebaseapp.com",
    projectId: "quicktalk-c7486",
    storageBucket: "quicktalk-c7486.firebasestorage.app",
    messagingSenderId: "343153380167",
    appId: "1:343153380167:web:49c50664eb6a078a76da62",
    measurementId: "G-H8H3K6GGGQ"
};

const app = firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/images/quicktalk-logo.png' // You can customize this path
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});