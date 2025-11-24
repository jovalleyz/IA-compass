import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GlobalAnswers, QuestionnaireResponse, UseCase } from '@/types/framework';
import { toast } from 'sonner';

export const useEvaluations = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [currentEvaluationId, setCurrentEvaluationId] = useState<string | null>(null);

  const saveGlobalEvaluation = async (globalAnswers: GlobalAnswers) => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      // Calculate maturity scores from global answers
      const estrategiaScore = calculateCategoryScore(globalAnswers, 'estrategia');
      const datosScore = calculateCategoryScore(globalAnswers, 'datos');
      const tecnologiaScore = calculateCategoryScore(globalAnswers, 'tecnologia');
      const talentoScore = calculateCategoryScore(globalAnswers, 'personas');
      const casosScore = calculateCategoryScore(globalAnswers, 'valor');
      const riesgosScore = calculateCategoryScore(globalAnswers, 'riesgos');
      
      const puntajeTotal = (estrategiaScore + datosScore + tecnologiaScore + talentoScore + casosScore + riesgosScore) / 6;
      
      console.log('[Organizational Maturity Calculation]', {
        estrategiaScore,
        datosScore,
        tecnologiaScore,
        talentoScore,
        casosScore,
        riesgosScore,
        puntajeTotal
      });
      
      let nivelMadurez = 'Inicial';
      if (puntajeTotal >= 3.5) nivelMadurez = 'Avanzado';
      else if (puntajeTotal >= 2.5) nivelMadurez = 'Intermedio';

      const { data, error } = await supabase
        .from('evaluations')
        .insert([{
          user_id: userId,
          global_answers: globalAnswers as any,
          estrategia_score: estrategiaScore,
          datos_score: datosScore,
          tecnologia_score: tecnologiaScore,
          talento_score: talentoScore,
          casos_score: casosScore,
          riesgos_score: riesgosScore,
          puntaje_total: puntajeTotal,
          nivel_madurez: nivelMadurez,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setCurrentEvaluationId(data.id);
      return data.id;
    } catch (error: any) {
      toast.error('Error al guardar la evaluación');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveUseCaseEvaluation = async (
    useCase: UseCase,
    response: QuestionnaireResponse,
    evaluationId: string
  ) => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      // Calculate maturity score from use case responses
      const ratingAnswers = Object.entries(response.answers)
        .filter(([_, value]) => typeof value === 'number')
        .map(([_, value]) => value as number);
      
      const useCaseMaturityScore = ratingAnswers.length > 0
        ? ratingAnswers.reduce((a, b) => a + b, 0) / ratingAnswers.length
        : 0;
      
      console.log('[Use Case Maturity] Rating answers:', ratingAnswers, 'Score:', useCaseMaturityScore);

      // Calculate strategic alignment from strategy questions
      const strategyAnswers = Object.entries(response.answers)
        .filter(([key]) => key.includes('estrategia') || key.includes('valor'))
        .filter(([_, value]) => typeof value === 'number')
        .map(([_, value]) => value as number);
      
      const strategicAlignment = strategyAnswers.length > 0
        ? strategyAnswers.reduce((a, b) => a + b, 0) / strategyAnswers.length
        : 0;
      
      console.log('[Strategic Alignment] Strategy answers:', strategyAnswers, 'Alignment:', strategicAlignment);

      // Get organizational maturity to calculate gap
      const { data: evaluation } = await supabase
        .from('evaluations')
        .select('puntaje_total')
        .eq('id', evaluationId)
        .single();

      const organizationalMaturity = evaluation?.puntaje_total || 0;
      console.log('[Organizational Maturity] From DB:', evaluation?.puntaje_total, 'Used:', organizationalMaturity);
      const maturityGap = Math.abs(organizationalMaturity - useCaseMaturityScore);

      const { data, error } = await supabase
        .from('use_cases')
        .insert([{
          user_id: userId,
          evaluation_id: evaluationId,
          industria: useCase.industry,
          nombre: useCase.title,
          descripcion: useCase.description,
          tipo_ia: 'Generativa',
          impacto: useCase.impact,
          complejidad: useCase.complexity,
          alineamiento_estrategico: Math.round(strategicAlignment * 10) / 10,
          nivel_madurez_requerido: Math.round(useCaseMaturityScore * 10) / 10,
          madurez_gap: Math.round(maturityGap * 10) / 10,
          estado: 'evaluado',
          es_personalizado: useCase.id?.startsWith('custom-') || false,
          respuestas: response.answers as any,
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      toast.error('Error al guardar el caso de uso');
      return null;
    } finally{
      setLoading(false);
    }
  };

  const loadLatestEvaluation = async () => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*, use_cases(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error: any) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadUserUseCases = async () => {
    if (!userId) return [];
    
    setLoading(true);
    try {
      // Only load use cases that haven't been converted to initiatives
      const { data, error } = await supabase
        .from('use_cases')
        .select('*')
        .eq('user_id', userId)
        .is('status_case', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveSelectedUseCase = async (useCase: UseCase, evaluationId?: string) => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      // Check if already exists (both 'identificado' and 'evaluado' states)
      const { data: existing } = await supabase
        .from('use_cases')
        .select('id')
        .eq('user_id', userId)
        .eq('nombre', useCase.title)
        .in('estado', ['identificado', 'evaluado'])
        .maybeSingle();

      if (existing) {
        // Already exists, return existing id
        return existing.id;
      }

      const { data, error } = await supabase
        .from('use_cases')
        .insert([{
          user_id: userId,
          evaluation_id: evaluationId || null,
          industria: useCase.industry || 'General',
          nombre: useCase.title,
          descripcion: useCase.description,
          tipo_ia: useCase.aiType,
          impacto: useCase.impact,
          complejidad: useCase.complexity,
          estado: 'identificado',
          es_personalizado: useCase.id?.startsWith('custom-') || false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      console.error('Error saving use case:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteUseCase = async (useCaseTitle: string, useCaseId?: string) => {
    if (!userId) return false;
    
    setLoading(true);
    try {
      // Try to delete by database ID first if available
      if (useCaseId && !useCaseId.startsWith('custom-')) {
        const { error } = await supabase
          .from('use_cases')
          .delete()
          .eq('id', useCaseId)
          .eq('user_id', userId);

        if (!error) return true;
      }

      // Fallback to deleting by title
      const { error } = await supabase
        .from('use_cases')
        .delete()
        .eq('user_id', userId)
        .eq('nombre', useCaseTitle)
        .eq('estado', 'identificado');

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error deleting use case:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    currentEvaluationId,
    saveGlobalEvaluation,
    saveUseCaseEvaluation,
    loadLatestEvaluation,
    loadUserUseCases,
    saveSelectedUseCase,
    deleteUseCase,
  };
};

// Helper function to calculate category scores
const calculateCategoryScore = (answers: GlobalAnswers, category: string): number => {
  const answersObj = (answers as any).answers || answers;
  
  // Filter category-specific answers
  const categoryAnswers = Object.entries(answersObj)
    .filter(([key]) => {
      // Match keys that include the category name
      const keyLower = key.toLowerCase();
      const categoryLower = category.toLowerCase();
      
      // Special handling for "personas" vs "talento"
      if (categoryLower === 'personas') {
        return keyLower.includes('personas') || keyLower.includes('talento');
      }
      
      return keyLower.includes(categoryLower);
    })
    .map(([key, value]) => {
      // Only include numeric values (ratings)
      if (typeof value === 'number') {
        return value;
      }
      return null;
    })
    .filter((val): val is number => val !== null);

  // If no numeric answers found, return default
  if (categoryAnswers.length === 0) {
    console.warn(`No numeric answers found for category: ${category}`);
    return 0;
  }
  
  const average = categoryAnswers.reduce((a, b) => a + b, 0) / categoryAnswers.length;
  console.log(`Category ${category}: ${categoryAnswers.length} answers, average: ${average.toFixed(2)}`);
  
  return average;
};
