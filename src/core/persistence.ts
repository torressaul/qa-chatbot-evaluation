import * as fs from "fs";
import * as path from "path";
import type { ScenarioResult } from "../types";
import { admin, getDb } from "../services/firebase.service";

export async function saveResult(result: ScenarioResult, index: number): Promise<void> {
  const outputDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `escenario-${index}.json`);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`\n  💾 Guardado localmente: output/escenario-${index}.json`);

  const db = getDb();
  if (!db) {
    return;
  }

  try {
    await db.collection("chatbot_evaluations").doc(`escenario-${index}`).set({
      ...result,
      firestoreTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`  ☁️  Guardado en Firestore: chatbot_evaluations/escenario-${index}`);
  } catch (error) {
    console.error(`  ❌ Error Firestore: ${error}`);
  }
}
