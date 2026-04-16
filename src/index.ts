import { validateEnv } from "./config/env";
import { initFirebase } from "./services/firebase.service";
import { dialogptState } from "./services/dialogpt.service";
import { scenarios } from "./scenarios/scenarios";
import { runScenario } from "./core/runScenario";
import { saveResult } from "./core/persistence";
import { sleep } from "./utils/helpers";

async function main(): Promise<void> {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║   Simulación de diálogo entre modelos conversacionales         ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  validateEnv();
  initFirebase();

  dialogptState.disponible = true;
  dialogptState.intentado = false;
  dialogptState.motivoFallo = "";

  const summary: { escenario: string; veredicto: string; fallback: string }[] = [];

  for (let i = 0; i < scenarios.length; i++) {
    try {
      const result = await runScenario(scenarios[i]);
      await saveResult(result, i + 1);
      summary.push({
        escenario: result.escenario,
        veredicto: result.veredicto,
        fallback: result.metadata?.fallbackActivado ? "SÍ" : "NO",
      });
    } catch (error) {
      console.error(`\n❌ Error fatal en escenario ${i + 1}:`, error);
      summary.push({
        escenario: scenarios[i].nombre,
        veredicto: "ERROR",
        fallback: "N/A",
      });
    }

    if (i < scenarios.length - 1) {
      console.log("\n⏳ Pausa entre escenarios (2s)...");
      await sleep(2000);
    }
  }

  console.log("\n\n╔════════════════════════════════════════════════╗");
  console.log("║                 RESUMEN FINAL                   ║");
  console.log("╚════════════════════════════════════════════════╝");

  summary.forEach((s, i) => {
    const emoji = { PASS: "✅", FAIL: "❌", PARCIAL: "⚠️", ERROR: "💥" }[s.veredicto] ?? "❓";
    console.log(`  ${i + 1}. ${s.escenario.padEnd(30)} ${emoji} ${s.veredicto} | fallback: ${s.fallback}`);
  });

  if (!dialogptState.disponible) {
    console.log("\n⚠️ DialoGPT no estuvo disponible; se utilizó fallback para garantizar la continuidad de la evaluación.");
    console.log(`🪵 Motivo registrado: ${dialogptState.motivoFallo}`);
  }
}

main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});
