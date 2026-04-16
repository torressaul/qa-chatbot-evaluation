import { groqNextMessage } from "../services/groq.service";
import { getChatbotResponse } from "../services/chatbot.service";
import { groqEvaluate } from "../evaluators/conversation.evaluator";
import { dialogptState } from "../services/dialogpt.service";
import { sleep, truncateForConsole } from "../utils/helpers";
import type { Scenario, ScenarioResult, Turn } from "../types";

export async function runScenario(scenario: Scenario): Promise<ScenarioResult> {
  const line = "─".repeat(60);
  console.log(`\n${line}`);
  console.log(`🎬  ESCENARIO: ${scenario.nombre}`);
  console.log(`📋  ${scenario.descripcion}`);
  console.log(line);

  const turnos: Turn[] = [];
  const pastUserInputs: string[] = [];
  const generatedResponses: string[] = [];
  const providersUsados: ("dialogpt" | "groq-fallback")[] = [];

  let intentosDialoGPT = 0;
  let fallbackActivado = false;
  let currentMessage = scenario.primerMensaje;

  for (let i = 0; i < 4; i++) {
    console.log(`\n  ── Turno ${i + 1} ─────────────────────────`);

    turnos.push({ rol: "groq", mensaje: currentMessage });
    console.log(`  👤 Usuario simulado: ${truncateForConsole(currentMessage)}`);

    let chatbotResponse = "[sin respuesta]";
    let provider: "dialogpt" | "groq-fallback" = "groq-fallback";

    try {
      intentosDialoGPT += dialogptState.disponible ? 1 : 0;

      const result = await getChatbotResponse(currentMessage, turnos, pastUserInputs, generatedResponses);
      chatbotResponse = result.respuesta;
      provider = result.provider;
      providersUsados.push(provider);

      if (result.fallbackActivado) {
        fallbackActivado = true;
      }
    } catch (error) {
      console.error(`  ❌ Error total al obtener respuesta del chatbot: ${error}`);
      chatbotResponse = "[Error: sin respuesta del chatbot]";
      providersUsados.push("groq-fallback");
      fallbackActivado = true;
    }

    pastUserInputs.push(currentMessage);
    generatedResponses.push(chatbotResponse);
    turnos.push({ rol: "dialogpt", mensaje: chatbotResponse });

    const etiquetaProveedor = provider === "dialogpt" ? "DialoGPT" : "Fallback Groq";
    console.log(`  🤖 ${etiquetaProveedor}: ${truncateForConsole(chatbotResponse)}`);
    console.log("  ───────────────────────────────────────────");

    if (i < 3) {
      try {
        await sleep(700);
        currentMessage = await groqNextMessage(scenario.systemPrompt, turnos);
      } catch (error) {
        console.error(`  ❌ Error generando siguiente mensaje: ${error}`);
        currentMessage = "¿Podrías contarme más?";
      }
    }
  }

  console.log(`\n  📊 Evaluando conversación...`);
  let evaluacion: { veredicto: "PASS" | "FAIL" | "PARCIAL"; analisis: string } = {
    veredicto: "PARCIAL",
    analisis: "Evaluación no disponible.",
  };

  try {
    evaluacion = await groqEvaluate(scenario.nombre, turnos);
  } catch (error) {
    console.error(`  ❌ Error en evaluación: ${error}`);
  }

  const result: ScenarioResult = {
    escenario: scenario.nombre,
    descripcion: scenario.descripcion,
    turnos,
    veredicto: evaluacion.veredicto,
    analisis: evaluacion.analisis,
    timestamp: new Date().toISOString(),
    metadata: {
      intentosDialoGPT,
      fallbackActivado,
      respuestasGeneradasPor: providersUsados,
    },
  };

  const emoji = { PASS: "✅", FAIL: "❌", PARCIAL: "⚠️" }[result.veredicto];
  console.log(`\n  ${emoji} Veredicto : ${result.veredicto}`);
  console.log(`  📝 Análisis  : ${result.analisis}`);

  if (fallbackActivado) {
    console.log(`  🛟 Nota      : Se utilizó fallback a Groq en al menos un turno.`);
  }

  return result;
}
