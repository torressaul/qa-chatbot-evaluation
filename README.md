# QA Engineer — Evaluación Automatizada de Chatbot

## Descripción

Este proyecto implementa un sistema de evaluación automatizada para analizar el comportamiento de un chatbot mediante simulaciones controladas de conversación.

La solución genera interacciones entre un **usuario simulado** y un **chatbot**, manteniendo contexto completo a lo largo de múltiples turnos, y posteriormente evalúa la calidad de la conversación utilizando un modelo de lenguaje.

El sistema está diseñado con un enfoque de resiliencia ante fallos de APIs externas, permitiendo la ejecución completa incluso cuando uno de los servicios no está disponible.

---

## Objetivos

* Simular conversaciones realistas entre usuario y chatbot
* Mantener contexto conversacional en múltiples turnos
* Evaluar automáticamente la calidad de las respuestas
* Integrar múltiples servicios de IA mediante APIs
* Implementar manejo robusto de errores y fallback

---

## Tecnologías

* Node.js
* TypeScript
* Groq API (LLMs)
* Hugging Face Inference API (DialoGPT)
* Firebase Firestore (opcional)
* JSON (persistencia local)

---

## Requisitos del Entorno

Antes de ejecutar el proyecto, asegúrate de contar con:

* Node.js >= 18
* npm >= 9

---

## Dependencias Adicionales

Para el correcto funcionamiento de TypeScript en entorno Node.js, es necesario instalar:

```
npm install --save-dev @types/node
```

Esto permite el tipado correcto de módulos nativos como:

* `fs`
* `path`
* `process`

---

## Arquitectura

El sistema se compone de tres módulos principales:

* **Usuario simulado**

  * Genera mensajes dinámicos basados en un escenario definido
  * Mantiene coherencia con el historial de conversación

* **Chatbot**

  * Intenta responder utilizando DialoGPT vía Hugging Face
  * En caso de fallo, utiliza un modelo de Groq como fallback

* **Evaluador**

  * Analiza la conversación completa
  * Determina un veredicto: `PASS`, `FAIL` o `PARCIAL`

Flujo general:

```
Usuario (Groq)
    ↓
Chatbot (DialoGPT → fallback Groq)
    ↓
Evaluador (Groq)
    ↓
Resultados (JSON / Firestore)
```

---

## Escenarios de Prueba

El sistema ejecuta cuatro escenarios distintos:

1. **Consulta simple**
   Interacción básica con saludo, pregunta y seguimiento.

2. **Cambio de tema**
   El usuario cambia abruptamente el contexto de la conversación.

3. **Reformulación de pregunta**
   Se evalúa consistencia ante múltiples formas de la misma pregunta.

4. **Conversación emocional**
   Se analiza la capacidad de respuesta ante contenido emocional.

Cada escenario ejecuta exactamente **4 turnos conversacionales**.

---

## Manejo de Contexto

El contexto se mantiene enviando el historial completo en cada llamada al modelo:

```
past_user_inputs
generated_responses
```

Esto permite evaluar correctamente la coherencia y continuidad de la conversación.

---

## Integración con Hugging Face

Se implementó integración con el modelo:

```
microsoft/DialoGPT-medium
```

usando el endpoint oficial:

```
https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium
```

### Problema detectado

Durante la ejecución, el endpoint responde con:

```
HTTP 404: Cannot POST /models/microsoft/DialoGPT-medium
```

Esto indica que el modelo no está disponible en la API de inferencia de Hugging Face.

---

## Estrategia de Resiliencia

Para garantizar la ejecución del sistema, se implementó un mecanismo de fallback:

```
DialoGPT → fallo → fallback Groq
```

### Comportamiento

* Se intenta usar DialoGPT con reintentos controlados
* Si falla:

  * Se marca como no disponible
  * Se registra el error
  * Se desactiva para el resto de la ejecución
* Las siguientes respuestas se generan con Groq

Esta estrategia evita fallos en cascada y mantiene la continuidad del sistema.

---

## Evaluación Automática

El evaluador analiza:

* coherencia de respuestas
* mantenimiento del contexto
* relevancia de la conversación

Formato de salida:

```json
{
  "veredicto": "PASS",
  "analisis": "Explicación breve del resultado"
}
```

---

## Estructura del Proyecto

```
chat-test/
├── src/
│   └── index.ts
├── output/
│   ├── escenario-1.json
│   ├── escenario-2.json
│   ├── escenario-3.json
│   └── escenario-4.json
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## Instalación

```
git clone <repo>
cd chat-test
npm install
```

---

## Configuración

Crear archivo `.env`:

```
GROQ_API_KEY=tu_api_key
HF_TOKEN=tu_token_huggingface
```

---

## Ejecución

```
npm run dev
```

---

## Notas de Ejecución

* Si `HF_TOKEN` no está configurado o DialoGPT no responde, el sistema activará automáticamente el fallback.
* El proyecto está diseñado para continuar la ejecución incluso si uno de los servicios externos falla.
* Los resultados se generan en la carpeta `output/`.

---

## Salida del Sistema

Cada escenario genera un archivo JSON en la carpeta `output/` con:

* historial completo de la conversación
* veredicto
* análisis generado por IA
* metadatos de ejecución

---

## Decisiones Técnicas

### Uso de fallback en lugar de eliminar DialoGPT

DialoGPT se mantuvo en la arquitectura porque:

* forma parte del requerimiento original
* permite demostrar integración de APIs externas
* justifica el diseño de resiliencia ante fallos

---

### Uso de Groq como motor principal

Groq se utilizó debido a:

* baja latencia
* estabilidad
* calidad de respuestas
* facilidad de integración

---

## Limitaciones Conocidas

* El endpoint de DialoGPT en Hugging Face puede no estar disponible (HTTP 404)
* Dependencia de servicios externos para generación y evaluación
* Resultados pueden variar debido a la naturaleza probabilística de los modelos

---

## Posibles Mejoras

* Integración con múltiples modelos para comparación
* Métricas cuantitativas (latencia, longitud, consistencia)
* Dashboard de visualización
* Persistencia avanzada en base de datos

---

## Conclusión

El proyecto cumple con los objetivos planteados al implementar:

* simulación de conversaciones
* evaluación automatizada
* integración de APIs
* manejo robusto de errores

La solución demuestra un enfoque práctico hacia problemas reales de disponibilidad de servicios externos, aplicando estrategias de resiliencia y diseño modular.

---

## Autor

Proyecto desarrollado como parte de una prueba técnica orientada a QA Engineer.
