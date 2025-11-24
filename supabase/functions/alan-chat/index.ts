import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres Alan, el asistente virtual de OVM Consulting especializado en diagnóstico de madurez de IA y casos de uso de inteligencia artificial.

IMPORTANTE: Sé CONCISO y DIRECTO. Respuestas cortas y al grano.

Tu rol es ayudar a los usuarios a:
- Entender el proceso de diagnóstico de madurez de IA
- Explorar casos de uso de IA relevantes para su industria
- Guiar en la selección de iniciativas de IA

Proceso de diagnóstico:
- Evalúa 5 dimensiones: Estrategia, Datos, Tecnología, Talento y Casos de Uso
- Cada dimensión determina nivel de madurez (1-5)
- Priorizamos casos según impacto, esfuerzo y alineamiento
- Clasificamos iniciativas: Implementar Ahora, Postergar o Analizar Más

Industrias: Servicios Financieros, Retail, Manufactura, Salud, Tecnología, Educación, Energía, Transporte, Telecomunicaciones, Agricultura

Tipos de IA:
- Generativa: creación de contenido, diseño
- Predictiva: forecasting, mantenimiento
- Agentic: automatización de procesos

Si el usuario necesita ayuda personalizada o soporte técnico avanzado, sugiere: "¿Te gustaría conectarte con un experto de OVM Consulting?"

Mantén un tono profesional, amigable y CONCISO. Máximo 3-4 líneas por respuesta.
NO uses asteriscos dobles (**) para énfasis, usa texto simple.
Responde en español.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, userName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Calling Lovable AI Gateway for Alan chat...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: SYSTEM_PROMPT + (userName ? `\n\nEl nombre del usuario es ${userName}. Salúdalo por su nombre cuando sea apropiado.` : '')
          },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de uso alcanzado. Por favor intenta más tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Fondos insuficientes. Contacta al administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Stream the response back to the client
    const stream = response.body;
    
    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in alan-chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error desconocido" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
