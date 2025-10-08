// lib/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app"; // ←ここが重要！
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBzTR2dFBih3JV2H5LEHfyNua8EbGotmfk",
  authDomain: "lustworksbot.firebaseapp.com",
  projectId: "lustworksbot",
  storageBucket: "lustworksbot.appspot.com",
  messagingSenderId: "759397768550",
  appId: "1:759397768550:web:ecfcb3fb0da8698ed8bca7"
};

// 👇 ここで二重初期化を防ぐ
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
