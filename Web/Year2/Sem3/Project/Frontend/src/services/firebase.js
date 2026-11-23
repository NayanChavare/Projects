import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBDIWvnT-BPdPU1bZA3tHaWEgAx-r3k8Uc",
  authDomain: "pulsechat-aa466.firebaseapp.com",
  projectId: "pulsechat-aa466",
  storageBucket: "pulsechat-aa466.firebasestorage.app",
  messagingSenderId: "610644581184",
  appId: "1:610644581184:web:085807133298e59a8138a5",
  measurementId: "G-9VDKPB24T1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Auth helper
export async function signInWithGoogle() {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Phone Recaptcha setup helper
export function setupRecaptcha(elementId, callback) {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Recaptcha clear error:", e);
    }
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: "invisible",
    callback: (response) => {
      if (callback) callback(response);
    },
    "expired-callback": () => {
      console.warn("Recaptcha expired");
    },
  });

  return window.recaptchaVerifier;
}

// Send OTP to phone
export async function sendOtpToPhone(phoneNumber, appVerifier) {
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  return confirmationResult;
}

export { signOut };
