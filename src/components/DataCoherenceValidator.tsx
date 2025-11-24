import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DataCoherenceValidatorProps {
  dataAvailability: number; // datos_1
  dataQuality: number; // datos_2
  dataGovernance: boolean; // datos_3
  dataDescription: string; // datos_4
  onValidationComplete?: (isCoherent: boolean, feedback: string) => void;
}

export const DataCoherenceValidator = ({
  dataAvailability,
  dataQuality,
  dataGovernance,
  dataDescription,
  onValidationComplete
}: DataCoherenceValidatorProps) => {
  const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [validationFeedback, setValidationFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Solo validar si hay descripción con al menos 10 caracteres y todas las respuestas están completas
    if (dataDescription && dataDescription.trim().length > 10 && dataAvailability > 0 && dataQuality > 0) {
      validateCoherence();
    } else {
      setValidationStatus("idle");
    }
  }, [dataAvailability, dataQuality, dataGovernance, dataDescription]);

  const validateCoherence = async () => {
    if (!dataDescription || dataDescription.trim().length < 10 || !dataAvailability || !dataQuality) {
      return;
    }

    console.log("Iniciando validación de coherencia:", {
      dataAvailability,
      dataQuality,
      dataGovernance,
      dataDescription
    });

    setIsLoading(true);
    setValidationStatus("validating");

    try {
      // Crear el prompt de validación
      const prompt = `Analiza la coherencia entre la descripción de disponibilidad de datos y las respuestas numéricas del usuario:

DESCRIPCIÓN DEL USUARIO:
"${dataDescription}"

RESPUESTAS A PREGUNTAS:
1. Suficiencia de datos de calidad: ${dataAvailability}/5 ${getDataAvailabilityLabel(dataAvailability)}
2. Accesibilidad e integración de datos: ${dataQuality}/5 ${getDataQualityLabel(dataQuality)}
3. Gobernanza de datos establecida: ${dataGovernance ? "Sí" : "No"}

TAREA:
Determina si la descripción es COHERENTE con las calificaciones numéricas. Debes ser ESTRICTO y detectar inconsistencias.

CRITERIOS DE COHERENCIA (SÉ MUY ESTRICTO):
- Si calificación 1-2: La descripción debe mencionar problemas graves, falta de datos, datos dispersos, mala calidad, archivos manuales, Excel sin integración
- Si calificación 3: La descripción debe mostrar situación mixta, algunos datos disponibles pero con limitaciones claras
- Si calificación 4-5: La descripción debe indicar datos robustos, bien organizados, sistemas integrados, bases de datos centralizadas, accesibles

EJEMPLOS DE INCOHERENCIA QUE DEBES DETECTAR:
❌ Calificación 5/5 pero descripción menciona "Excel", "hojas de cálculo", "archivos manuales", "no tenemos datos", "datos dispersos"
❌ Calificación 5/5 pero descripción dice "base de datos Excel" (Excel NO es una base de datos robusta para calificación 5)
❌ Calificación 1/5 pero descripción dice "data lake", "data warehouse", "sistema integrado", "centralizado"
❌ Gobernanza = Sí pero descripción no menciona políticas, procesos o estándares
❌ Gobernanza = No pero descripción menciona "políticas de datos", "estándares establecidos", "procesos formales"

IMPORTANTE: Si el usuario menciona "Excel", "hojas de cálculo" o "archivos" con calificaciones altas (4-5), es INCOHERENTE.

RESPONDE EN ESTE FORMATO JSON:
{
  "coherent": true/false,
  "feedback": "Explicación breve y específica sobre la coherencia o inconsistencias encontradas (máximo 2 frases)"
}`;

      console.log("Enviando solicitud a Edge Function...");
      const { data, error } = await supabase.functions.invoke('validate-data-coherence', {
        body: { prompt }
      });

      console.log("Respuesta de Edge Function:", { data, error });

      if (error) {
        console.error("Error en Edge Function:", error);
        throw error;
      }

      const result = data?.result;
      
      if (result) {
        console.log("Resultado de validación:", result);
        setValidationStatus(result.coherent ? "valid" : "invalid");
        setValidationFeedback(result.feedback);
        onValidationComplete?.(result.coherent, result.feedback);
      } else {
        console.error("No se recibió resultado válido");
      }
    } catch (error) {
      console.error("Error validating data coherence:", error);
      // No mostrar error al usuario, solo no validar
      setValidationStatus("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const getDataAvailabilityLabel = (rating: number): string => {
    if (rating <= 2) return "(Datos insuficientes)";
    if (rating === 3) return "(Datos limitados)";
    if (rating === 4) return "(Datos buenos)";
    return "(Datos excelentes)";
  };

  const getDataQualityLabel = (rating: number): string => {
    if (rating <= 2) return "(Baja calidad/dispersos)";
    if (rating === 3) return "(Calidad media)";
    if (rating === 4) return "(Buena calidad)";
    return "(Excelente calidad)";
  };

  if (validationStatus === "idle" || !dataDescription || dataDescription.trim().length < 10) {
    return null;
  }

  if (isLoading || validationStatus === "validating") {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Validando coherencia...</AlertTitle>
        <AlertDescription>
          Analizando la consistencia entre tu descripción y las calificaciones
        </AlertDescription>
      </Alert>
    );
  }

  if (validationStatus === "valid") {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Descripción coherente</AlertTitle>
        <AlertDescription className="text-green-700">
          {validationFeedback}
        </AlertDescription>
      </Alert>
    );
  }

  if (validationStatus === "invalid") {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Posible inconsistencia detectada</AlertTitle>
        <AlertDescription className="text-amber-700">
          {validationFeedback}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
