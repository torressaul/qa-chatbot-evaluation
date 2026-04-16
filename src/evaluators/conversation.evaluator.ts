import type { EvaluationResult, Turn } from "../types";
import { groq } from "../services/groq.service";

export async function groqEvaluate(escenario: string, turnos: Turn[]): Promise<EvaluationResult> {
  const transcript = turnos.map((t) => `[${t.rol.toUpperCase()}]: ${t.mensaje}`).join("\n");

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You are a strict QA evaluator for chatbot conversations.
Respond ONLY with a valid JSON object — no markdown, no extra text.
Use this exact structure:
{"veredicto":"PASS|FAIL|PARCIAL","analisis":"2-3 sentence explanation in Spanish"}

Evaluation criteria:
- PASS: The chatbot understood all messages, responses were coherent and contextually relevant, the conversation made complete sense.
- FAIL: The chatbot clearly failed to understand, gave off-topic or nonsensical responses, or lost context entirely.
- PARCIAL: Some responses were relevant but there were significant coherence issues or partial context loss.`,
      },
      {
        role: "user",
        content: `Scenario: "${escenario}"\n\nConversation transcript:\n${transcript}\n\nEvaluate.`,
      },
    ],
    max_tokens: 300,
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";

  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      veredicto: (["PASS", "FAIL", "PARCIAL"].includes(parsed.veredicto) ? parsed.veredicto : "PARCIAL") as EvaluationResult["veredicto"],
      analisis: parsed.analisis ?? "No se pudo generar análisis.",
    };
  } catch {
    return { veredicto: "PARCIAL", analisis: raw };
  }
}
