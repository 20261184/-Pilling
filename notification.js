import {
  getMessaging,
  getToken
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

import { app } from "./firebase.js";

const messaging = getMessaging(app);

// Firebase Console에서 발급받은 Web Push 인증서 키
const VAPID_KEY = "BLHwltosQGKrNvtCjNbOqrfTGqz3txqfbAzfUbeAmizJ30mSG2al28QJHkOi9u9Lr23Nbr-qEsHFVR3IupUUvJ4";

export async function setupNotification() {

  try {

    // 브라우저가 알림을 지원하는지 확인
    if (!("Notification" in window)) {
      alert("이 브라우저는 알림을 지원하지 않습니다.");
      return null;
    }

    // 알림 권한 요청
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("알림 권한이 허용되지 않았습니다.");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "./firebase-messaging-sw.js"
    );

    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      alert("알림 토큰을 가져오지 못했습니다.");
      return null;
    }

    console.log("FCM 토큰:", token);

    // 나중에 Firebase에 저장할 수 있음
    localStorage.setItem("fcmToken", token);

    return token;

  } catch (error) {

    console.error("알림 설정 오류:", error);

    alert(
      "알림 설정 중 오류가 발생했습니다.\n" +
      error.message
    );

    return null;
  }
}