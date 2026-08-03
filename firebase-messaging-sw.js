importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyD33b5IstDUfZoBnREjbyuNZiogp9JK_NU",
  authDomain: "pilling-30c08.firebaseapp.com",
  projectId: "pilling-30c08",
  storageBucket: "pilling-30c08.firebasestorage.app",
  messagingSenderId: "324600052477",
  appId: "1:324600052477:web:e9d8b3bdf17b8a77271c94",
  measurementId: "G-JJ7BCZTV8W"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("백그라운드 알림:", payload);

  const title = payload.notification?.title || "Pilling";
  const options = {
    body: payload.notification?.body || "복용 시간이에요!",
    icon: "/logo.png"
  };

  self.registration.showNotification(title, options);
});