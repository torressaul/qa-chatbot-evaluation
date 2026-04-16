import { callDialoGPT, dialogptState } from "./dialogpt.service";
import { callGroqFallbackChatbot } from "./groq.service";
import type { ChatbotResponse, Turn } from "../types";

export async function getChatbotResponse(
  currentMessage: string,
  turnos: Turn[],
  pastUserInputs: string[],
  generatedResponses: string[]
): Promise<ChatbotResponse> {
  if (dialogptState.disponible) {
    try {
      dialogptState.intentado = true;

      const respuesta = await callDialoGPT(currentMessage, pastUserInputs, generatedResponses);

      return {
        respuesta,
        provider: "dialogpt",
        fallbackActivado: false,
      };
    } catch (error) {
      dialogptState.disponible = false;
      dialogptState.motivoFallo = error instanceof Error ? error.message : String(error);

      console.log("   ⚠️ DialoGPT no disponible. Se usará fallback desde este punto.");
      console.log(`   🪵 Motivo: ${dialogptState.motivoFallo}`);
    }
  }

  const respuesta = await callGroqFallbackChatbot(turnos);

  return {
    respuesta,
    provider: "groq-fallback",
    fallbackActivado: true,
  };
}
