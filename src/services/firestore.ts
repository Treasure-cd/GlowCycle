import { db } from "./firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import type { SkinScores } from "./youcam";
import type { WeatherData } from "./weather";
import { documentId } from "firebase/firestore";

export interface JournalEntry {
  date: string; 
  text: string;
  updatedAt: Date;
}

export async function saveJournalEntry(uid: string, dateKey: string, text: string) {
  await setDoc(
    doc(db, "users", uid, "journalEntries", dateKey),
    { text, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getJournalEntry(uid: string, dateKey: string): Promise<JournalEntry | null> {
  const snap = await getDoc(doc(db, "users", uid, "journalEntries", dateKey));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    date: dateKey,
    text: data.text as string,
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
  };
}

export async function getJournalEntries(uid: string): Promise<JournalEntry[]> {
  const entriesQuery = query(
    collection(db, "users", uid, "journalEntries"),
    orderBy(documentId(), "desc")
  );
  const snapshot = await getDocs(entriesQuery);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      date: d.id,
      text: data.text as string,
      updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
    };
  });
}

export interface ScanRecord {
  id: string;
  results: SkinScores;
  weather: WeatherData | null;
  cycleDay: number;
  createdAt: Date;
}

export async function getScanHistory(uid: string): Promise<ScanRecord[]> {
  const scansQuery = query(
    collection(db, "users", uid, "scans"),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(scansQuery);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      results: data.results as SkinScores,
      weather: (data.weather as WeatherData) ?? null,
      cycleDay: data.cycleDay as number,
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    };
  });
}

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


export async function saveScanResult(uid: string, results: unknown, weather: unknown, cycleDay: number) {
  await setDoc(doc(db, "users", uid), { hasScanned: true }, { merge: true });
  
  await addDoc(collection(db, "users", uid, "scans"), {
    results,
    weather,
    cycleDay,
    createdAt: serverTimestamp(),
  });
}

export async function updateLastPeriodStart(uid: string, dateString: string) {
  await setDoc(doc(db, "users", uid), { lastPeriodStart: dateString }, { merge: true });
}