export interface Turn {
  rol: "groq" | "dialogpt";
  mensaje: string;
}

export interface ScenarioResult {
  escenario: string;
  descripcion: string;
  turnos: Turn[];
  veredicto: "PASS" | "FAIL" | "PARCIAL";
  analisis: string;
  timestamp: string;
  metadata?: {
    intentosDialoGPT: number;
    fallbackActivado: boolean;
    respuestasGeneradasPor: ("dialogpt" | "groq-fallback")[];
  };
}

export interface Scenario {
  nombre: string;
  descripcion: string;
  systemPrompt: string;
  primerMensaje: string;
}

export interface EvaluationResult {
  veredicto: "PASS" | "FAIL" | "PARCIAL";
  analisis: string;
}

export interface ChatbotResponse {
  respuesta: string;
  provider: "dialogpt" | "groq-fallback";
  fallbackActivado: boolean;
}

export interface HFSuccessResponse {
  generated_text?: string;
  conversation?: {
    generated_responses?: string[];
    past_user_inputs?: string[];
  };
}

export interface HFErrorResponse {
  error?: string;
  estimated_time?: number;
}

export type HFResponse = HFSuccessResponse | HFErrorResponse | HFSuccessResponse[];
