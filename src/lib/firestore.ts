import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  fullName: string;
  birthYear: number;
  lastPeriodStart: string;
  climate: string;
  onboardingComplete: boolean;
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, "onboardingComplete">
) {
  await setDoc(doc(db, "users", uid), {
    ...data,
    onboardingComplete: true,
    createdAt: serverTimestamp(),
  });
}