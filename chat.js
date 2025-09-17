// Import all the necessary Firebase functions and modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, getDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js";
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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
const messaging = getMessaging(app);

// IMPORTANT: Replace 'YOUR_VAPID_KEY' with your actual VAPID key from Firebase Project Settings
const vapidKey = 'YOUR_VAPID_KEY';

// Get references to HTML elements
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messagesContainer');
const roomList = document.getElementById('room-list');
const currentRoomDisplay = document.getElementById('current-room');
const logoutBtn = document.getElementById('logout');
const createRoomBtn = document.getElementById('create-room');
const leaveRoomBtn = document.getElementById('leave-room');

// Set the initial chat room
let currentRoom = "General";
let unsubscribeFromMessages = null;

// Function to request notification permission and get the FCM token
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: vapidKey
            });
            console.log("FCM Token: ", token);
            
            // Save this token to the current user's document in Firestore
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, { fcmToken: token }, { merge: true });
            
        } else {
            console.log("Permission denied for notifications.");
        }
    } catch (error) {
        console.error("Error getting permission or token: ", error);
    }
}

// Handle incoming messages while the app is in the foreground
onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/images/quicktalk-logo.png'
    };
    new Notification(notificationTitle, notificationOptions);
});

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Call this function when the user is logged in
        requestNotificationPermission();
        setupMessageListener(currentRoom);
    } else {
        window.location.href = "index.html";
    }
});

// Event listener for sending messages
// Event listener for sending messages
if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // <--- Add this line
        const messageText = messageInput.value;
        if (messageText.trim() === '') return;
        try {
            await addDoc(collection(db, "rooms", currentRoom, "messages"), {
                text: messageText,
                sender: auth.currentUser.uid,
                timestamp: serverTimestamp()
            });
            messageInput.value = '';
        } catch (error) {
            console.error("Error adding message: ", error);
        }
    });
}

// Function to set up the real-time listener for a specific room
function setupMessageListener(roomId) {
    if (unsubscribeFromMessages) {
        unsubscribeFromMessages();
    }
    const messagesRef = collection(db, "rooms", roomId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp"));

    unsubscribeFromMessages = onSnapshot(messagesQuery, async (snapshot) => {
        messagesContainer.innerHTML = '';
        for (const messageDoc of snapshot.docs) {
            const message = messageDoc.data();
            const senderId = message.sender;

            const userDocRef = doc(db, "users", senderId);
            const userDoc = await getDoc(userDocRef);
            let senderName = "Unknown User";
            if (userDoc.exists()) {
                senderName = userDoc.data().username;
            }

            // 1. Handle Timestamp
            let formattedTime = "";
            if (message.timestamp && message.timestamp.toDate) {
                const date = message.timestamp.toDate();
                formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // 2. Handle Text Formatting
            let formattedText = message.text;
            formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            formattedText = formattedText.replace(/\*(.*?)\*/g, '<i>$1</i>');
            formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

            const messageElement = document.createElement("div");
            messageElement.classList.add('message');
            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="username">${senderName}:</span>
                    <span class="timestamp">${formattedTime}</span>
                </div>
                <div class="message-text">${formattedText}</div>
            `;
            messagesContainer.appendChild(messageElement);
        }

        // Add this line to enable auto-scrolling to the bottom of the chat window
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}
// Event listener to change rooms
if (roomList) {
    roomList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            currentRoom = e.target.textContent;
            currentRoomDisplay.textContent = `Room: ${currentRoom}`;
            setupMessageListener(currentRoom);
        }
    });
}
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const roomsSidebar = document.getElementById('rooms-sidebar');

if (toggleSidebarBtn && roomsSidebar) {
    toggleSidebarBtn.addEventListener('click', () => {
        roomsSidebar.classList.toggle('visible');
    });
}

// Display available rooms
onSnapshot(collection(db, "rooms"), (snapshot) => {
    let roomsHtml = '';
    snapshot.forEach((doc) => {
        roomsHtml += `<li data-id="${doc.id}">${doc.id}</li>`;
    });
    roomList.innerHTML = roomsHtml;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Add a click listener to the create-room button
createRoomBtn.addEventListener('click', async () => {
    const roomName = prompt("Enter a name for the new room:");
    if (roomName && roomName.trim() !== '') {
        const roomsCollection = collection(db, "rooms");
        try {
            await setDoc(doc(roomsCollection, roomName), {});
            console.log("New room created:", roomName);
        } catch (error) {
            console.error("Error creating room:", error);
            alert("Failed to create room. It may already exist.");
        }
    }
});

// Event listener for the "Leave Room" button
if (leaveRoomBtn) {
    leaveRoomBtn.addEventListener('click', () => {
        if (unsubscribeFromMessages) {
            unsubscribeFromMessages();
        }
        currentRoom = "General";
        currentRoomDisplay.textContent = `Room: ${currentRoom}`;
        setupMessageListener(currentRoom);
    });
}

// Event listener for the logout button
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = "index.html";
});