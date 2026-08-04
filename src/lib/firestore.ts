import { doc, getDoc, addDoc, collection, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  fullName: string;
  birthYear: number;
  lastPeriodStart: string;
  climate: string;
  onboardingComplete: boolean;
  hasScanned: boolean;
}

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, "onboardingComplete" | "hasScanned">
) {
  await setDoc(doc(db, "users", uid), {
    ...data,
    onboardingComplete: true,
    hasScanned: false,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}


export async function saveScanResult(uid: string, results: unknown) {
  await setDoc(doc(db, "users", uid), { hasScanned: true }, { merge: true });
  await addDoc(collection(db, "users", uid, "scans"), {
    results,
    createdAt: serverTimestamp(),
  });
}