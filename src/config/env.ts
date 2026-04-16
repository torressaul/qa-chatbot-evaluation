import * as dotenv from "dotenv";

dotenv.config();

export function validateEnv(): void {
  const required = ["GROQ_API_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`❌ Variables de entorno faltantes: ${missing.join(", ")}`);
  }

  if (!process.env.HF_TOKEN) {
    console.warn("⚠️  HF_TOKEN no configurado. DialoGPT fallará y se usará fallback a Groq.");
  }
}
