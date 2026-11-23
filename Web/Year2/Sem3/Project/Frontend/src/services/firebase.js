import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
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

// Register with Email and send verification link
export async function registerWithEmailFirebase(email, password, name) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (name && userCredential.user) {
    try {
      await updateProfile(userCredential.user, { displayName: name });
    } catch (e) {
      console.warn("Could not set displayName:", e);
    }
  }
  // Send email verification link directly from Firebase
  await sendEmailVerification(userCredential.user);
  return userCredential.user;
}

// Login with Email in Firebase
export async function loginWithEmailFirebase(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Resend verification email
export async function resendVerificationLink(user) {
  if (user) {
    await sendEmailVerification(user);
    return true;
  }
  return false;
}

export { signOut };
