import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCUkFsmY8oT-5Y9mLzcj7sX5yQUbbA_IEQ",
  authDomain: "gen-lang-client-0127264030.firebaseapp.com",
  projectId: "gen-lang-client-0127264030",
  storageBucket: "gen-lang-client-0127264030.firebasestorage.app",
  messagingSenderId: "89379665295",
  appId: "1:89379665295:web:632a6ec92f057335af07fa",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Prompt account selection every time for Google Sign-In
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Sign in with Google Popup
 * Returns Firebase UserCredential
 */
export async function signInWithGooglePopup() {
  const result = await signInWithPopup(auth, googleProvider);
  return result;
}

/**
 * Register user in Firebase Auth and send verification email
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: any }>}
 */
export async function sendFirebaseEmailVerification(email, password) {
  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      // If already registered in Firebase from a previous attempt, sign in to re-send
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInErr) {
        throw err;
      }
    } else {
      throw err;
    }
  }

  // Send Firebase Email Verification link to the user's inbox
  await sendEmailVerification(userCredential.user);
  return userCredential;
}

/**
 * Check if the user's email has been verified in Firebase
 * @param {string} email
 * @param {string} password
 * @returns {Promise<boolean>}
 */
export async function checkFirebaseEmailVerified(email, password) {
  let currentUser = auth.currentUser;

  if (!currentUser || currentUser.email.toLowerCase() !== email.toLowerCase()) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      currentUser = cred.user;
    } catch (err) {
      return false;
    }
  }

  // Reload user state from Firebase servers to fetch latest emailVerified boolean
  await currentUser.reload();
  return !!currentUser.emailVerified;
}

/**
 * Resend verification email to current user
 */
export async function resendVerificationEmail() {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
    return true;
  }
  return false;
}
