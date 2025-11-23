import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { app } from "./firebase";

export async function getFCMToken(): Promise<string | null> {
  const isMessagingSupported = await isSupported();
  if (!isMessagingSupported) {
    console.warn(
      "Firebase Messaging is not supported in this environment (e.g., non-HTTPS, old browser)."
    );
    return null;
  }

  try {
    const messaging = getMessaging(app);

    const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY;

    if (!VAPID_KEY) {
      console.error(
        "VITE_FCM_VAPID_KEY is missing from environment variables."
      );
      return null;
    }

    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });

    if (currentToken) {
      console.log("FCM Token successfully retrieved.");
      return currentToken;
    } else {
      console.log(
        "No registration token available. User may have denied permission."
      );
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving FCM token:", error);
    return null;
  }
}
