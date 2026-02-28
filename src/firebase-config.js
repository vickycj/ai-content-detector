import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

// Enable App Check debug token for local development
if (location.hostname === "localhost") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// Initialize App Check with reCAPTCHA v3
const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
if (recaptchaKey && recaptchaKey !== "YOUR_RECAPTCHA_SITE_KEY") {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(recaptchaKey),
    isTokenAutoRefreshEnabled: true,
  });
}

// Initialize AI with Gemini Developer API (free tier, no billing required)
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

// Using gemini-2.5-flash — free tier, multimodal, no billing required
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

export { model };
