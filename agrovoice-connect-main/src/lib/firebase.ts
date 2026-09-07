import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  ConfirmationResult,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

// Your Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCzaXytAbiCOp89WgIZdMx29yZky7TRkX0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "agro-voice-ca0f7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "agro-voice-ca0f7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "agro-voice-ca0f7.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "889306883369",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:889306883369:web:703848d019b64d75470338",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TK63G52QEQ",
};

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Sign-In Provider
const googleProvider = new GoogleAuthProvider();

// Simple Authentication Functions
export const loginWithGooglePopup = () => signInWithPopup(auth, googleProvider);
export const loginWithEmailPass = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const registerWithEmailPass = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
export const loginAsGuest = () => signInAnonymously(auth);
export const logoutUser = () => signOut(auth);

// Phone OTP Helper
export function setupRecaptcha(containerId: string) {
  if (typeof window === "undefined") return null;
  return new RecaptchaVerifier(auth, containerId, { size: "invisible" });
}

export const requestPhoneOtp = (phone: string, verifier: RecaptchaVerifier) =>
  signInWithPhoneNumber(auth, phone, verifier);

/**
 * Remove undefined values because Firestore rejects objects containing `undefined`
 */
export function sanitizeData(data: Record<string, any>) {
  const clean: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      clean[key] = data[key];
    }
  });
  return clean;
}

// Firestore Realtime Collections
export const saveShipment = async (shipment: any) => {
  try {
    const cleanData = sanitizeData(shipment);
    await setDoc(doc(db, "shipments", shipment.id), cleanData);
    console.log("✅ Shipment saved to Firebase Firestore:", shipment.id);
    return true;
  } catch (err: any) {
    console.error("❌ Firebase Firestore saveShipment Error:", err);
    throw err;
  }
};

export const updateShipment = async (id: string, data: any) => {
  try {
    const cleanData = sanitizeData(data);
    await updateDoc(doc(db, "shipments", id), cleanData);
    console.log("✅ Shipment updated in Firebase Firestore:", id);
    return true;
  } catch (err: any) {
    console.error("❌ Firebase Firestore updateShipment Error:", err);
    throw err;
  }
};

export const saveRoute = async (route: any) => {
  try {
    const cleanData = sanitizeData(route);
    await setDoc(doc(db, "routes", route.id), cleanData);
    console.log("✅ Route saved to Firebase Firestore:", route.id);
    return true;
  } catch (err: any) {
    console.error("❌ Firebase Firestore saveRoute Error:", err);
    throw err;
  }
};

export const updateRoute = async (id: string, data: any) => {
  try {
    const cleanData = sanitizeData(data);
    await updateDoc(doc(db, "routes", id), cleanData);
    console.log("✅ Route updated in Firebase Firestore:", id);
    return true;
  } catch (err: any) {
    console.error("❌ Firebase Firestore updateRoute Error:", err);
    throw err;
  }
};

export const subscribeShipments = (cb: (items: any[]) => void) => {
  try {
    return onSnapshot(
      query(collection(db, "shipments"), orderBy("createdAt", "desc")),
      (snap) => {
        cb(snap.docs.map((d) => d.data()));
      },
      (err) => {
        console.warn("Firestore shipments subscription notice:", err.message);
      }
    );
  } catch (err) {
    console.warn("Firestore subscription error:", err);
    return () => {};
  }
};

export const subscribeRoutes = (cb: (items: any[]) => void) => {
  try {
    return onSnapshot(
      collection(db, "routes"),
      (snap) => {
        cb(snap.docs.map((d) => d.data()));
      },
      (err) => {
        console.warn("Firestore routes subscription notice:", err.message);
      }
    );
  } catch (err) {
    console.warn("Firestore routes subscription error:", err);
    return () => {};
  }
};

export { onAuthStateChanged };
export type { ConfirmationResult };
