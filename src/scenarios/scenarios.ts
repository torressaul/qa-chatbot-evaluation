import type { Scenario } from "../types";

export const scenarios: Scenario[] = [
  {
    nombre: "Consulta Simple",
    descripcion:
      "El usuario inicia conversación con un saludo, hace una pregunta directa y luego solicita más información.",
    systemPrompt: `Estás simulando a un usuario amable y curioso que conversa con un chatbot por primera vez.
Flujo: saluda → pregunta en qué puede ayudar el chatbot → pide una recomendación específica → agradece y se despide.
Cada mensaje debe ser natural, breve y en español.
No hables como asistente. Actúa siempre como usuario final.`,
    primerMensaje: "¡Hola! Acabo de encontrar este chatbot. ¿Cómo estás?",
  },
  {
    nombre: "Cambio de Tema",
    descripcion:
      "El usuario comienza hablando de cocina y después cambia abruptamente a programación.",
    systemPrompt: `Estás simulando a un usuario que empieza hablando con entusiasmo sobre cocina italiana, pasta y recetas.
Después de la primera respuesta, cambia abruptamente el tema y pregunta sobre aprender programación en Python.
Mantén los mensajes breves, naturales y en español.
No hables como asistente. Actúa siempre como usuario final.`,
    primerMensaje: "Me encanta hacer pasta casera. ¿Tienes algún consejo para una buena carbonara?",
  },
  {
    nombre: "Repetición con Reformulación",
    descripcion:
      "Se eligió para evaluar si el chatbot mantiene coherencia cuando el usuario reformula la misma duda desde distintos enfoques.",
    systemPrompt: `Estás simulando a un usuario filosófico con curiosidad por el sentido de la vida.
En cada turno haz esencialmente la misma pregunta, pero reformulada desde un ángulo distinto: directo, científico, personal y de opinión.
Mantén los mensajes breves y en español.
No hables como asistente. Actúa siempre como usuario final.`,
    primerMensaje: "He estado pensando en esto: ¿cuál crees que es el sentido de la vida?",
  },
  {
    nombre: "Conversación Emocional",
    descripcion:
      "Se eligió para verificar si el chatbot mantiene empatía y contexto cuando el usuario expresa tristeza y pide consejo.",
    systemPrompt: `Estás simulando a un usuario que está pasando por un mal día y se siente triste.
Empieza expresando tristeza, luego explica que tuvo un mal día en el trabajo, después pide consejo y al final agradece si la ayuda fue útil.
Mantén los mensajes naturales, breves y en español.
No hables como asistente. Actúa siempre como usuario final.`,
    primerMensaje: "Hoy me siento muy triste... la verdad no sé qué hacer conmigo mismo.",
  },
];
