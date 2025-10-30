/* eslint-disable no-undef, no-restricted-globals */

importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBZLVezWPfPS_79VSLmJgZvW3w3g_MI-yE",
  authDomain: "thiqah-30599.firebaseapp.com",
  projectId: "thiqah-30599",
  storageBucket: "thiqah-30599.firebasestorage.app",
  messagingSenderId: "1018162172535",
  appId: "1:1018162172535:web:4d1b3469713d74a1f42c72",
  measurementId: "G-2JG9ED48ZS"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
