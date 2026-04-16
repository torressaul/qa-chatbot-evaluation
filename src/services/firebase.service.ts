import * as admin from "firebase-admin";

let db: admin.firestore.Firestore | null = null;

export function initFirebase(): void {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!sa) {
    console.log("⚠️  FIREBASE_SERVICE_ACCOUNT no configurado — se omite Firestore.");
    return;
  }

  try {
    const serviceAccount = JSON.parse(sa);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    db = admin.firestore();
    console.log("🔥 Firebase inicializado correctamente.");
  } catch (error) {
    console.error("❌ Error al inicializar Firebase:", error);
  }
}

export function getDb(): admin.firestore.Firestore | null {
  return db;
}

export { admin };
