export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function sanitizeModelReply(text: string): string {
  return text.replace(/^["'\s]+|["'\s]+$/g, "").replace(/\s+/g, " ").trim();
}

export function truncateForConsole(text: string, max = 220): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}...` : clean;
}

export function normalizeUserMessage(text: string): string {
  let clean = text.replace(/\s+/g, " ").trim();
  clean = clean.replace(/^(usuario|user|asistente|assistant)\s*:\s*/i, "");
  clean = clean.replace(/^["'“”]+|["'“”]+$/g, "");

  const forbiddenStarts = [
    "puedo ayudarte",
    "puedo ayudar",
    "te puedo ayudar",
    "quiero ayudarte",
    "estoy aquí para ayudarte",
    "como chatbot",
    "como asistente",
    "soy un chatbot",
    "soy un asistente",
    "en qué puedo ayudarte",
    "¿en qué puedo ayudarte",
  ];

  const lower = clean.toLowerCase();
  if (forbiddenStarts.some((s) => lower.startsWith(s))) {
    return "Entiendo. ¿Podrías contarme un poco más?";
  }

  return clean;
}

export function formatHFError(status: number, body: string): string {
  const cleanBody = body
    .replace(/<!DOCTYPE html>[\s\S]*?<pre>/i, "")
    .replace(/<\/pre>[\s\S]*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleanBody ? `HTTP ${status}: ${cleanBody}` : `HTTP ${status}: error desconocido en Hugging Face`;
}
