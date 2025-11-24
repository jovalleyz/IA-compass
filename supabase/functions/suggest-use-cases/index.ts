import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry, maturityLevel, maturityScore, globalAnswers } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating use case suggestions for:', { industry, maturityLevel, maturityScore });

    const systemPrompt = `Eres un consultor experto en IA y transformación digital. Tu tarea es sugerir casos de uso personalizados de IA para una organización específica.

Debes considerar:
- La industria de la organización
- Su nivel de madurez digital (Inicial, Intermedio, Avanzado)
- Sus respuestas al cuestionario de evaluación
- Sugerir casos de uso realistas y alcanzables según su madurez

INSTRUCCIONES:
1. Analiza cuidadosamente el contexto proporcionado
2. Sugiere entre 3-5 casos de uso de IA personalizados
3. Para cada caso de uso incluye:
   - Título claro y específico
   - Descripción detallada (2-3 párrafos)
   - Por qué es relevante para esta organización específica
   - Complejidad estimada (low/medium/high) acorde a su madurez
   - Impacto potencial (low/medium/high)
   - Tipo de IA recomendada (Machine Learning, NLP, Computer Vision, etc.)
   - Requisitos de datos aproximados

IMPORTANTE: 
- Para organizaciones con madurez "Inicial", sugiere casos de uso de complejidad "low" a "medium"
- Para "Intermedio", casos de "medium" a "high"
- Para "Avanzado", cualquier complejidad es válida
- Los casos deben ser específicos de la industria
- Evita jerga técnica excesiva`;

    const userPrompt = `Contexto de la organización:
- Industria: ${industry}
- Nivel de madurez digital: ${maturityLevel}
- Puntaje de madurez: ${maturityScore}/5

Respuestas del cuestionario global:
${JSON.stringify(globalAnswers, null, 2)}

Por favor, sugiere casos de uso de IA personalizados para esta organización.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_use_cases',
              description: 'Devuelve una lista de casos de uso de IA personalizados',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        rationale: { type: 'string' },
                        complexity: { type: 'string', enum: ['low', 'medium', 'high'] },
                        impact: { type: 'string', enum: ['low', 'medium', 'high'] },
                        aiType: { type: 'string' },
                        dataRequirements: { type: 'string' }
                      },
                      required: ['title', 'description', 'rationale', 'complexity', 'impact', 'aiType', 'dataRequirements'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['suggestions'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_use_cases' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Límite de solicitudes excedido. Por favor, intenta más tarde.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Fondos insuficientes en Lovable AI. Por favor, agrega créditos.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received:', JSON.stringify(data));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const suggestions = JSON.parse(toolCall.function.arguments);
    console.log('Parsed suggestions:', suggestions);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in suggest-use-cases:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
