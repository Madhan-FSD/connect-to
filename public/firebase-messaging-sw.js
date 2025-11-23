importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyB5Yisk7DQup-H9KGAITcP6aZoNdHtiEiQ",
  authDomain: "pp-chat-v2-real.firebaseapp.com",
  projectId: "pp-chat-v2-real",
  messagingSenderId: "714295574174",
  appId: "1:714295574174:web:74064cb4da7b0ba308c58f",
};

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
