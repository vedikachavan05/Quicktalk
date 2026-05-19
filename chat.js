// Import all the necessary Firebase functions and modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, getDoc, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js";

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

const vapidKey = 'YOUR_VAPID_KEY'; // Ensure this is replaced with your actual key

// HTML Element References
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messagesContainer');
const roomList = document.getElementById('room-list');
const currentRoomDisplay = document.getElementById('current-room');
const logoutBtn = document.getElementById('logout');
const createRoomBtn = document.getElementById('create-room');
const leaveRoomBtn = document.getElementById('leave-room');

let currentRoom = "General";
let unsubscribeFromMessages = null;

// --- Authentication & Permissions ---

onAuthStateChanged(auth, (user) => {
    if (user) {
        requestNotificationPermission();
        setupMessageListener(currentRoom);
    } else {
        window.location.href = "index.html";
    }
});

async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, { vapidKey: vapidKey });
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, { fcmToken: token }, { merge: true });
        }
    } catch (error) {
        console.error("Notification error: ", error);
    }
}

// --- Chat Logic ---

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
            const isMe = (senderId === auth.currentUser.uid);

            const userDoc = await getDoc(doc(db, "users", senderId));
            let senderName = userDoc.exists() ? userDoc.data().username : "Unknown User";

            let formattedTime = "";
            if (message.timestamp?.toDate) {
                formattedTime = message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // Markdown-style formatting
            let formattedText = message.text
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\*(.*?)\*/g, '<i>$1</i>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

            const messageElement = document.createElement("div");
            messageElement.classList.add('message');
            if (isMe) messageElement.classList.add('my-message');

            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="username">${isMe ? 'You' : senderName}:</span>
                    <span class="timestamp">${formattedTime}</span>
                </div>
                <div class="message-text">${formattedText}</div>
            `;
            messagesContainer.appendChild(messageElement);
        }
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (!text) return;
        try {
            await addDoc(collection(db, "rooms", currentRoom, "messages"), {
                text: text,
                sender: auth.currentUser.uid,
                timestamp: serverTimestamp()
            });
            messageInput.value = '';
        } catch (error) {
            console.error("Send error: ", error);
        }
    });
}

// --- Room Management ---

// Display available rooms from Firestore
onSnapshot(collection(db, "rooms"), (snapshot) => {
    let roomsHtml = '';
    snapshot.forEach((doc) => {
        roomsHtml += `<li data-id="${doc.id}">${doc.id}</li>`;
    });
    roomList.innerHTML = roomsHtml;
});

// Switch rooms via sidebar
if (roomList) {
    roomList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            currentRoom = e.target.textContent;
            currentRoomDisplay.textContent = `Room: ${currentRoom}`;
            setupMessageListener(currentRoom);
        }
    });
}

// Create a new room
createRoomBtn.addEventListener('click', async () => {
    const roomName = prompt("Enter a name for the new room:");
    if (roomName?.trim()) {
        try {
            await setDoc(doc(db, "rooms", roomName.trim()), {});
        } catch (error) {
            console.error("Room creation error: ", error);
        }
    }
});

/**
 * FIX: LEAVE ROOM FUNCTIONALITY
 * Switches back to 'General' room without a page reload.
 */
leaveRoomBtn.addEventListener('click', () => {
    if (currentRoom === "General") {
        alert("You are already in the General room.");
        return;
    }
    
    if (confirm("Are you sure you want to leave this room and go back to General?")) {
        currentRoom = "General";
        currentRoomDisplay.textContent = `Room: ${currentRoom}`;
        setupMessageListener(currentRoom);
        console.log("Returned to General room.");
    }
});

// --- Logout ---
logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = "index.html";
});