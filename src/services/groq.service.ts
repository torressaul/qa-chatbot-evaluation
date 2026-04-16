import Groq from "groq-sdk";
import type { Turn } from "../types";
import { normalizeUserMessage, sanitizeModelReply } from "../utils/helpers";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function callGroqFallbackChatbot(turnos: Turn[]): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Eres un chatbot útil, natural y conversacional.
Responde siempre en español.
Mantén coherencia con el contexto previo.
Da respuestas claras, relevantes y breves.
No repitas innecesariamente la pregunta del usuario.
No escribas listas largas salvo que sea indispensable.
Máximo 5 oraciones.`,
    },
    ...turnos.map<Groq.Chat.ChatCompletionMessageParam>((t) => ({
      role: t.rol === "groq" ? "user" : "assistant",
      content: t.mensaje,
    })),
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
    max_tokens: 140,
    temperature: 0.6,
  });

  return sanitizeModelReply(completion.choices[0]?.message?.content?.trim() || "[sin respuesta]");
}

export async function groqNextMessage(systemPrompt: string, turnos: Turn[]): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `${systemPrompt}

REGLAS IMPORTANTES:
- Responde ÚNICAMENTE con el siguiente mensaje que diría el usuario.
- No incluyas prefijos como "Usuario:", "User:", "Asistente:" o "Assistant:".
- No uses comillas.
- Mantén el mensaje natural, breve y completamente en español.
- Nunca hables como si fueras el chatbot o asistente.
- Nunca ofrezcas ayuda, nunca resuelvas la pregunta, nunca des recomendaciones como asistente.
- Debes sonar como una persona usuaria real: pregunta, responde, aclara, duda, agradece o cambia de tema según el escenario.
- No repitas ni completes la respuesta del asistente.
- No continúes listas del asistente ni escribas como si estuvieras corrigiendo su respuesta.
- Sigue estrictamente el contexto de la conversación previa.
- Máximo 2 oraciones.`,
    },
    ...turnos.map<Groq.Chat.ChatCompletionMessageParam>((t) => ({
      role: t.rol === "groq" ? "user" : "assistant",
      content: t.mensaje,
    })),
    {
      role: "user",
      content: "Escribe únicamente el siguiente mensaje del usuario.",
    },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
    max_tokens: 80,
    temperature: 0.45,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "¿Podrías contarme más?";
  return normalizeUserMessage(raw);
}
