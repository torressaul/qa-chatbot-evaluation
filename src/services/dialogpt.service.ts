import type { HFResponse } from "../types";
import { formatHFError, sanitizeModelReply, sleep } from "../utils/helpers";

const DIALOGPT_ENDPOINT =
  "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";

export const dialogptState = {
  disponible: true,
  intentado: false,
  motivoFallo: "",
};

export async function callDialoGPT(
  text: string,
  pastUserInputs: string[],
  generatedResponses: string[],
  retries = 3
): Promise<string> {
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    throw new Error("HF_TOKEN no configurado.");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(DIALOGPT_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            past_user_inputs: pastUserInputs,
            generated_responses: generatedResponses,
            text,
          },
          options: {
            wait_for_model: true,
            use_cache: false,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.status === 503) {
        const waitSecs = 5 * attempt;
        console.log(`   ⏳ DialoGPT cargándose... esperando ${waitSecs}s`);
        await sleep(waitSecs * 1000);
        continue;
      }

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(formatHFError(response.status, errBody));
      }

      const data = (await response.json()) as HFResponse;

      if (!Array.isArray(data) && "error" in data && data.error) {
        if (data.estimated_time) {
          const waitSecs = Math.ceil(data.estimated_time) + 2;
          console.log(`   ⏳ DialoGPT necesita ${waitSecs}s para cargar...`);
          await sleep(waitSecs * 1000);
          continue;
        }
        throw new Error(data.error);
      }

      let reply = "";

      if (!Array.isArray(data) && "generated_text" in data && data.generated_text) {
        reply = data.generated_text.trim();
      }

      if (!reply && !Array.isArray(data) && "conversation" in data && data.conversation?.generated_responses?.length) {
        const responses = data.conversation.generated_responses;
        reply = responses[responses.length - 1]?.trim() ?? "";
      }

      if (!reply && Array.isArray(data) && data.length > 0) {
        const first = data[0];
        if (first?.generated_text) {
          reply = first.generated_text.trim();
        }
      }

      if (!reply) {
        throw new Error("DialoGPT respondió sin contenido útil.");
      }

      return sanitizeModelReply(reply);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (attempt === retries) {
        throw new Error(message);
      }

      console.log(`   ⚠️ Reintento DialoGPT (${attempt}/${retries})`);
      await sleep(1800);
    }
  }

  throw new Error("DialoGPT falló sin devolver respuesta.");
}
