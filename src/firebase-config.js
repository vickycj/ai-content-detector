import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: "REDACTED_API_KEY",
  authDomain: "ai-content-detector-54774.firebaseapp.com",
  projectId: "ai-content-detector-54774",
  storageBucket: "ai-content-detector-54774.firebasestorage.app",
  messagingSenderId: "360805054350",
  appId: "1:360805054350:web:a0d52d73d4f15b5826d6df",
};

const firebaseApp = initializeApp(firebaseConfig);

const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

// Using gemini-2.5-flash — free tier, multimodal, no billing required
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

export { model };
