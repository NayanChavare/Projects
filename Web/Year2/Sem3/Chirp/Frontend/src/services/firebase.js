import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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

// Prompt account selection every time
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
