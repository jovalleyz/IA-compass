import React, { useState, useEffect } from "react";
import { Sparkles, Brain, Target, CheckCircle2, Rocket, X, LogOut, User, LayoutDashboard, TrendingUp, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/NotificationBell";
import StepIndicator from "@/components/StepIndicator";
import UseCaseCatalog from "@/components/UseCaseCatalog";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import GlobalQuestionnaireForm from "@/components/GlobalQuestionnaireForm";
import PrioritizationMatrix from "@/components/PrioritizationMatrix";
import ActionPlan from "@/components/ActionPlan";
import ExecutiveReport from "@/components/ExecutiveReport";
import ExecutiveReportEnhanced from "@/components/ExecutiveReportEnhanced";
import MaturityGauge from "@/components/MaturityGauge";
import AIUseCaseSuggestions from "@/components/AIUseCaseSuggestions";
import TrafficLightValidator from "@/components/TrafficLightValidator";
import { InteractiveRoadmap } from "@/components/InteractiveRoadmap";
import Footer from "@/components/Footer";
import AddCustomUseCaseDialog from "@/components/AddCustomUseCaseDialog";
import { UseCaseDetailDialog } from "@/components/UseCaseDetailDialog";
import { useCases as initialUseCases } from "@/data/useCases";
import { UseCase, QuestionnaireResponse, GlobalAnswers } from "@/types/framework";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEvaluations } from "@/hooks/useEvaluations";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { calculateValidationResults } from "@/utils/validationUtils";

const steps = [
  { number: 1, title: "Diagnóstico", description: "Evaluación de necesidades" },
  { number: 2, title: "Identificación", description: "Casos de uso potenciales" },
  { number: 3, title: "Evaluación", description: "Viabilidad y preparación" },
  { number: 4, title: "Validación", description: "Semáforo de preparación" },
  { number: 5, title: "Priorización", description: "Matriz impacto vs esfuerzo" },
  { number: 6, title: "Plan de Acción", description: "Reporte ejecutivo" }
];

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminStatus(user?.id);
  const { 
    saveGlobalEvaluation, 
    saveUseCaseEvaluation, 
    loadLatestEvaluation, 
    currentEvaluationId,
    loadUserUseCases,
    saveSelectedUseCase,
    deleteUseCase,
  } = useEvaluations(user?.id);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [useCases, setUseCases] = useState<UseCase[]>(initialUseCases);
  const [selectedUseCases, setSelectedUseCases] = useState<UseCase[]>([]);
  const [globalAnswers, setGlobalAnswers] = useState<GlobalAnswers | null>(null);
  const [evaluatedUseCases, setEvaluatedUseCases] = useState<QuestionnaireResponse[]>([]);
  const [currentEvaluatingIndex, setCurrentEvaluatingIndex] = useState(0);
  const [maturityScore, setMaturityScore] = useState(0);
  const [maturityLevel, setMaturityLevel] = useState("Inicial");
  const [userIndustry, setUserIndustry] = useState("");
  const [profileData, setProfileData] = useState<{ nombre: string; foto_perfil_url: string | null } | null>(null);
  const [selectedUseCaseDetail, setSelectedUseCaseDetail] = useState<UseCase | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Load latest evaluation and user use cases on mount
  useEffect(() => {
    const loadData = async () => {
      // Load profile data
      if (user?.id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('nombre, foto_perfil_url')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfileData(profileData);
        }
      }

      const evaluation = await loadLatestEvaluation();
      if (evaluation) {
        setGlobalAnswers(evaluation.global_answers as unknown as GlobalAnswers);
        setMaturityScore(evaluation.puntaje_total || 0);
        setMaturityLevel(evaluation.nivel_madurez || "Inicial");
        
        // Extract industry from global answers
        const answersObj = (evaluation.global_answers as any)?.answers || evaluation.global_answers;
        const industryAnswer = answersObj?.global_estrategia_industria || answersObj?.industria || '';
        setUserIndustry(industryAnswer);
      }
      
      // Load saved use cases
      const savedUseCases = await loadUserUseCases();
      if (savedUseCases.length > 0) {
        // Convert DB use cases to UseCase type
        const convertedUseCases = savedUseCases.map(dbUseCase => ({
          id: dbUseCase.es_personalizado ? `custom-${dbUseCase.id}` : dbUseCase.id,
          dbId: dbUseCase.id, // Store the database ID
          title: dbUseCase.nombre,
          category: dbUseCase.es_personalizado ? 'Personalizado' : 'Catálogo',
          industry: dbUseCase.industria,
          description: dbUseCase.descripcion || '',
          aiType: dbUseCase.tipo_ia || '',
          complexity: dbUseCase.complejidad as 'low' | 'medium' | 'high',
          impact: dbUseCase.impacto as 'low' | 'medium' | 'high',
          benefits: [],
          dataRequirements: '',
          isUserCreated: dbUseCase.es_personalizado
        }));
        
        // Add custom use cases to catalog
        const customUseCases = convertedUseCases.filter(uc => uc.id.startsWith('custom-'));
        if (customUseCases.length > 0) {
          setUseCases(prev => {
            const existingIds = new Set(prev.map(uc => uc.id));
            const newCustomCases = customUseCases.filter(uc => !existingIds.has(uc.id));
            return [...prev, ...newCustomCases];
          });
        }
        
        // Set selected use cases (only those in estado 'identificado' or 'evaluado')
        const identifiedCases = savedUseCases
          .filter(uc => uc.estado === 'identificado' || uc.estado === 'evaluado')
          .map(dbUseCase => convertedUseCases.find(uc => uc.id === (dbUseCase.es_personalizado ? `custom-${dbUseCase.id}` : dbUseCase.id)))
          .filter(Boolean) as UseCase[];
        
        if (identifiedCases.length > 0) {
          setSelectedUseCases(identifiedCases);
        }
      }
    };
    
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesión cerrada");
    // Force full page reload to clear all state
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const handleFinishFramework = async () => {
    if (!user?.id || !globalAnswers || selectedUseCases.length === 0) {
      toast.error("Debe completar el diagnóstico y evaluar al menos un caso de uso");
      return;
    }

    try {
      await supabase
        .from('profiles')
        .update({ framework_completed: true })
        .eq('id', user.id);

      // Obtener el nombre del primer caso de uso seleccionado y su ID en la BD
      const firstUseCase = selectedUseCases[0];
      const useCaseName = firstUseCase?.title || 'Caso de Uso IA';
      
      // Buscar el use_case_id en la base de datos
      let useCaseId = null;
      if (firstUseCase?.id) {
        const { data: dbUseCase } = await supabase
          .from('use_cases')
          .select('id')
          .eq('nombre', useCaseName)
          .eq('user_id', user.id)
          .maybeSingle();
        
        useCaseId = dbUseCase?.id || null;
      }
      
      // Inferir unidad de negocio del caso de uso o del perfil del usuario
      let businessUnit = '';
      
      // Intentar obtener unidad de negocio del perfil del usuario
      const { data: profileData } = await supabase
        .from('profiles')
        .select('unidad_negocio')
        .eq('id', user.id)
        .single();
      
      if (profileData?.unidad_negocio) {
        businessUnit = profileData.unidad_negocio;
      } else {
        // Inferir por categoría del caso de uso
        const category = firstUseCase?.category?.toLowerCase() || '';
        if (category.includes('servicio') || category.includes('cliente')) {
          businessUnit = 'Atención al Cliente';
        } else if (category.includes('operacion')) {
          businessUnit = 'Operaciones';
        } else if (category.includes('tecnolog') || category.includes('ia')) {
          businessUnit = 'Tecnología';
        } else if (category.includes('ventas')) {
          businessUnit = 'Ventas';
        } else if (category.includes('marketing')) {
          businessUnit = 'Marketing';
        } else {
          businessUnit = 'Tecnología'; // Default
        }
      }

      const { data: initiative, error: initiativeError } = await supabase
        .from('initiatives')
        .insert({
          user_id: user.id,
          use_case_id: useCaseId,
          nombre: useCaseName,
          descripcion: selectedUseCases.length > 1 
            ? `Iniciativa basada en ${selectedUseCases.length} casos de uso: ${selectedUseCases.map(uc => uc.title).join(', ')}`
            : `Iniciativa para implementar: ${useCaseName}`,
          prioridad: maturityScore >= 3.5 ? 'alta' : maturityScore >= 2.5 ? 'media' : 'baja',
          puntaje_total: Number(maturityScore.toFixed(2)),
          unidad_negocio: businessUnit,
          recomendacion: maturityScore >= 3.5 ? 'implementar_ahora' : maturityScore >= 2.5 ? 'analizar_mas' : 'postergar',
        })
        .select()
        .single();

      if (initiativeError) throw initiativeError;

      const defaultStages = [
        { etapa: "Diagnóstico", orden: 1 },
        { etapa: "Diseño", orden: 2 },
        { etapa: "Piloto", orden: 3 },
        { etapa: "Escalamiento", orden: 4 },
        { etapa: "Operativo", orden: 5 },
      ];

      const { data: stages } = await supabase
        .from('initiative_stages')
        .insert(
          defaultStages.map(stage => ({
            initiative_id: initiative.id,
            ...stage,
          }))
        )
        .select();

      // Generate activities from blockers and warnings automatically
      if (stages && stages.length > 0 && globalAnswers) {
        const diagnosticoStage = stages.find(s => s.etapa === "Diagnóstico");
        
        if (diagnosticoStage) {
          console.log('Generating activities from validation gaps...');
          
          // Calculate validation results to get blockers and warnings
          const validationResults = calculateValidationResults(
            selectedUseCases,
            evaluatedUseCases,
            globalAnswers,
            maturityScore
          );

          const activitiesToCreate = [];

          for (const validation of validationResults) {
            // Add blocker activities with [CRÍTICO] prefix
            if (validation.bloqueadores && validation.bloqueadores.length > 0) {
              for (const blocker of validation.bloqueadores) {
                activitiesToCreate.push({
                  stage_id: diagnosticoStage.id,
                  nombre: `[CRÍTICO] ${blocker}`,
                  notas: `Bloqueador crítico identificado para: ${validation.useCase.title}`,
                  status: 'no_iniciado' as const,
                });
              }
            }

            // Add warning activities with [ATENCIÓN] prefix
            if (validation.warnings && validation.warnings.length > 0) {
              for (const warning of validation.warnings) {
                activitiesToCreate.push({
                  stage_id: diagnosticoStage.id,
                  nombre: `[ATENCIÓN] ${warning}`,
                  notas: `Advertencia identificada para: ${validation.useCase.title}`,
                  status: 'no_iniciado' as const,
                });
              }
            }
          }

          if (activitiesToCreate.length > 0) {
            const { error: activitiesError } = await supabase
              .from('initiative_activities')
              .insert(activitiesToCreate);
            
            if (activitiesError) {
              console.error('Error creating activities:', activitiesError);
            } else {
              console.log(`Created ${activitiesToCreate.length} activities from validation gaps`);
            }
          } else {
            console.log('No blockers or warnings found to create activities');
          }
        }
      }

      toast.success("Framework completado e iniciativa creada exitosamente");
      navigate('/initiatives');
    } catch (error) {
      console.error('Error creating initiative:', error);
      toast.error("Error al crear la iniciativa");
    }
  };

  const handleAddCustomUseCase = async (useCase: UseCase) => {
    setUseCases(prev => [...prev, useCase]);
    
    // Save to database
    const evalId = currentEvaluationId || (await loadLatestEvaluation())?.id;
    await saveSelectedUseCase(useCase, evalId);
  };

  const handleAddAISuggestion = async (useCase: UseCase) => {
    setUseCases(prev => [...prev, useCase]);
    setSelectedUseCases(prev => [...prev, useCase]);
    
    // Save to database
    const evalId = currentEvaluationId || (await loadLatestEvaluation())?.id;
    await saveSelectedUseCase(useCase, evalId);
  };

  const handleToggleUseCase = async (useCase: UseCase) => {
    const isAlreadySelected = selectedUseCases.some(uc => uc.id === useCase.id);
    
    if (isAlreadySelected) {
      setSelectedUseCases(prev => prev.filter(uc => uc.id !== useCase.id));
      
      // Delete from database when deselecting, using dbId if available
      await deleteUseCase(useCase.title, useCase.dbId);
      
      toast.success(`"${useCase.title}" removido de la selección`);
    } else {
      setSelectedUseCases(prev => [...prev, useCase]);
      
      // Save to database when selecting
      const evalId = currentEvaluationId || (await loadLatestEvaluation())?.id;
      await saveSelectedUseCase(useCase, evalId);
      
      toast.success(`"${useCase.title}" agregado a la evaluación`);
    }
  };

  const handleRemoveUseCase = async (useCase: UseCase) => {
    setSelectedUseCases(prev => prev.filter(uc => uc.id !== useCase.id));
    
    // Delete from database using dbId if available
    await deleteUseCase(useCase.title, useCase.dbId);
    
    toast.success(`"${useCase.title}" removido`);
  };

  const handleCompleteGlobalQuestionnaire = async (response: GlobalAnswers) => {
    setGlobalAnswers(response);
    setCurrentEvaluatingIndex(0);
    
    // Extract industry from global answers
    const answersObj = (response as any).answers || response;
    const industryAnswer = answersObj.global_estrategia_industria || answersObj.industria || '';
    setUserIndustry(industryAnswer);
    
    // Save to database and calculate maturity
    const evaluationId = await saveGlobalEvaluation(response);
    if (evaluationId) {
      // Load the evaluation that was just saved with correct scores
      const evaluation = await loadLatestEvaluation();
      if (evaluation) {
        const score = Number(evaluation.puntaje_total || 0);
        setMaturityScore(score);
        setMaturityLevel(evaluation.nivel_madurez || "Inicial");
        
        console.log('Maturity score calculated:', score, 'Level:', evaluation.nivel_madurez);
        toast.success("Evaluación global guardada exitosamente");
      }
    }
  };

  const handleCompleteQuestionnaire = async (response: QuestionnaireResponse) => {
    setEvaluatedUseCases(prev => [...prev, response]);
    
    // Save use case evaluation to database
    const useCase = selectedUseCases[currentEvaluatingIndex];
    const evalId = currentEvaluationId || (await loadLatestEvaluation())?.id;
    
    if (evalId && useCase) {
      await saveUseCaseEvaluation(useCase, response, evalId);
    }
    
    if (currentEvaluatingIndex < selectedUseCases.length - 1) {
      setCurrentEvaluatingIndex(prev => prev + 1);
      toast.success("Caso de uso evaluado. Continúe con el siguiente.");
    } else {
      toast.success("¡Todas las evaluaciones completadas!");
      setCurrentEvaluatingIndex(0);
    }
  };

  const handleNextStep = async () => {
    // Validar que la industria esté seleccionada en el paso 1
    if (currentStep === 1 && !userIndustry) {
      toast.error("Por favor seleccione una industria antes de continuar");
      return;
    }
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleIndustryChange = async (industry: string) => {
    setUserIndustry(industry);
    
    // Guardar industria en el perfil del usuario
    if (user?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ empresa: industry })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error saving industry:', error);
        toast.error("Error al guardar la industria");
      } else {
        toast.success(`Industria "${industry}" seleccionada`);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shrink-0">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
                  Framework IA Empresarial
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Identificación estratégica de casos de uso de IA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <ThemeToggle />
              <LanguageSelector />
              <Button variant="outline" size="sm" onClick={() => navigate("/analytics")} className="gap-1 sm:gap-2 h-8 sm:h-10 text-xs sm:text-sm whitespace-nowrap">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Analíticas</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/initiatives")} className="gap-1 sm:gap-2 h-8 sm:h-10 text-xs sm:text-sm whitespace-nowrap">
                <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Iniciativas</span>
              </Button>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="gap-1 sm:gap-2 h-8 sm:h-10 text-xs sm:text-sm whitespace-nowrap border-primary/50 hover:bg-primary/10">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  <span className="hidden sm:inline text-primary">Admin</span>
                </Button>
              )}
              <NotificationBell />
              
              {/* Perfil con foto y nombre */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile")}
                className="gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-4"
              >
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 shrink-0">
                  <AvatarImage src={profileData?.foto_perfil_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {profileData?.nombre?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline text-xs sm:text-sm truncate max-w-[100px]">{profileData?.nombre || 'Perfil'}</span>
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 sm:gap-2 h-8 sm:h-10 text-xs sm:text-sm">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Content based on current step */}
        <div className="mt-8 md:mt-12">
          {currentStep === 1 && (
            <div className="space-y-6 md:space-y-8">
              <div className="text-center max-w-3xl mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
                  Diagnóstico Estratégico y Evaluación de Necesidades
                </h2>
                <p className="text-base md:text-lg text-muted-foreground">
                  Determine si su organización está lista para implementar IA y dónde puede generar mayor valor
                </p>
              </div>

              {/* Selector de Industria */}
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Seleccione su Industria
                  </CardTitle>
                  <CardDescription>
                    Esta información nos ayudará a personalizar las sugerencias de casos de uso con IA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industria *</Label>
                    <Select value={userIndustry} onValueChange={handleIndustryChange}>
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Seleccione una industria..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Finanzas">Finanzas</SelectItem>
                        <SelectItem value="Banca">Banca</SelectItem>
                        <SelectItem value="Seguros">Seguros</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Manufactura">Manufactura</SelectItem>
                        <SelectItem value="Salud">Salud</SelectItem>
                        <SelectItem value="Tecnología">Tecnología</SelectItem>
                        <SelectItem value="Telecomunicaciones">Telecomunicaciones</SelectItem>
                        <SelectItem value="Educación">Educación</SelectItem>
                        <SelectItem value="Logística y Transporte">Logística y Transporte</SelectItem>
                        <SelectItem value="Energía">Energía</SelectItem>
                        <SelectItem value="Gobierno">Gobierno</SelectItem>
                        <SelectItem value="Medios y Entretenimiento">Medios y Entretenimiento</SelectItem>
                        <SelectItem value="Agricultura">Agricultura</SelectItem>
                        <SelectItem value="Construcción">Construcción</SelectItem>
                        <SelectItem value="Automotriz">Automotriz</SelectItem>
                        <SelectItem value="Turismo y Hospitalidad">Turismo y Hospitalidad</SelectItem>
                        <SelectItem value="Otra">Otra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {userIndustry && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      Industria seleccionada: <span className="font-semibold">{userIndustry}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <Target className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Objetivos Estratégicos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Identificar las prioridades corporativas donde la IA puede aportar valor significativo
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Sparkles className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Mapeo de Oportunidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Detectar problemas, ineficiencias y oportunidades donde la IA puede ser la solución
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Benchmark Competitivo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Evaluar qué está haciendo la competencia y tendencias de la industria
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleNextStep} 
                  size="lg" 
                  className="gap-2"
                  disabled={!userIndustry}
                >
                  Continuar a Identificación
                  <Rocket className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Identificación de Casos de Uso de IA Potenciales
                </h2>
                <p className="text-lg text-muted-foreground">
                  Explore nuestro catálogo con más de 65 casos de uso de IA aplicados en diferentes industrias
                </p>
              </div>

              <div className="flex justify-end mb-4">
                <AddCustomUseCaseDialog onAdd={handleAddCustomUseCase} />
              </div>

              {userIndustry && (
                <AIUseCaseSuggestions
                  industry={userIndustry}
                  maturityLevel={maturityLevel || "Inicial"}
                  maturityScore={maturityScore}
                  globalAnswers={globalAnswers || { answers: {} }}
                  onAddSuggestion={handleAddAISuggestion}
                />
              )}

              <UseCaseCatalog 
                useCases={useCases} 
                selectedUseCases={selectedUseCases}
                onToggleUseCase={handleToggleUseCase}
                defaultIndustry={userIndustry}
                onViewDetails={(useCase) => {
                  setSelectedUseCaseDetail(useCase);
                  setIsDetailDialogOpen(true);
                }}
              />

              {selectedUseCases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Casos de Uso Seleccionados ({selectedUseCases.length})</CardTitle>
                    <CardDescription>
                      Estos casos serán evaluados en el siguiente paso
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedUseCases.map((useCase) => (
                        <Badge 
                          key={useCase.id} 
                          variant="secondary"
                          className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-secondary/80 transition-colors"
                          onClick={() => {
                            setSelectedUseCaseDetail(useCase);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          {useCase.title}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveUseCase(useCase);
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between sticky bottom-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border shadow-lg z-10">
                <Button onClick={handlePreviousStep} variant="outline">
                  Volver a Diagnóstico
                </Button>
                <Button onClick={handleNextStep} disabled={selectedUseCases.length === 0}>
                  Continuar a Evaluación ({selectedUseCases.length} seleccionados)
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Evaluación de Viabilidad y Preparación
                </h2>
                <p className="text-lg text-muted-foreground">
                  {!globalAnswers 
                    ? "Primero responda las preguntas globales sobre su organización"
                    : selectedUseCases.length === 0
                    ? "No hay casos de uso seleccionados para evaluar"
                    : "Evalúe cada caso de uso seleccionado mediante nuestro cuestionario"}
                </p>
              </div>

              {selectedUseCases.length === 0 ? (
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>No hay casos de uso seleccionados</CardTitle>
                    <CardDescription>
                      Vuelva al paso anterior para seleccionar casos de uso del catálogo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => handleGoToStep(2)} variant="outline" className="w-full">
                      Volver a Identificación
                    </Button>
                  </CardContent>
                </Card>
              ) : !globalAnswers ? (
                <div className="max-w-4xl mx-auto">
                  <GlobalQuestionnaireForm onComplete={handleCompleteGlobalQuestionnaire} />
                </div>
              ) : evaluatedUseCases.length < selectedUseCases.length ? (
                <div className="max-w-4xl mx-auto space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Evaluando caso {currentEvaluatingIndex + 1} de {selectedUseCases.length}
                      </CardTitle>
                      <CardDescription>
                        Progreso: {evaluatedUseCases.length} de {selectedUseCases.length} completados
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <QuestionnaireForm
                    useCaseId={selectedUseCases[currentEvaluatingIndex].id}
                    useCaseTitle={selectedUseCases[currentEvaluatingIndex].title}
                    onComplete={handleCompleteQuestionnaire}
                  />
                </div>
              ) : (
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>✓ Evaluación Completada</CardTitle>
                    <CardDescription>
                      Todos los casos de uso han sido evaluados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Casos de Uso Evaluados:</h3>
                      <div className="space-y-2">
                        {evaluatedUseCases.map((evaluation, index) => {
                          const useCase = useCases.find(uc => uc.id === evaluation.useCaseId);
                          return (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <span>{useCase?.title}</span>
                              <Badge variant="outline">
                                Puntuación: {evaluation.score?.toFixed(1) || "N/A"}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between max-w-4xl mx-auto">
                <Button onClick={() => handleGoToStep(2)} variant="outline">
                  Volver a Identificación
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={evaluatedUseCases.length < selectedUseCases.length}
                >
                  Continuar a Priorización
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Validación de Preparación (Semáforo)
                </h2>
                <p className="text-lg text-muted-foreground">
                  Análisis automático de readiness organizacional para cada caso de uso
                </p>
              </div>

              {globalAnswers && (
                <TrafficLightValidator
                  selectedUseCases={selectedUseCases}
                  evaluatedUseCases={evaluatedUseCases}
                  globalAnswers={globalAnswers}
                  maturityScore={maturityScore}
                  maturityLevel={maturityLevel}
                />
              )}

              <div className="flex justify-between max-w-4xl mx-auto">
                <Button onClick={handlePreviousStep} variant="outline">
                  Volver a Evaluación
                </Button>
                <Button onClick={handleNextStep}>
                  Continuar a Priorización
                </Button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Priorización de Casos de Uso
                </h2>
                <p className="text-lg text-muted-foreground">
                  Matriz de impacto vs. esfuerzo para decidir por dónde empezar
                </p>
              </div>

              {globalAnswers && (
                <PrioritizationMatrix 
                  selectedUseCases={selectedUseCases}
                  evaluatedUseCases={evaluatedUseCases}
                  validationResults={calculateValidationResults(selectedUseCases, evaluatedUseCases, globalAnswers, maturityScore)}
                />
              )}

              <div className="flex justify-between max-w-4xl mx-auto">
                <Button onClick={handlePreviousStep} variant="outline">
                  Volver a Validación
                </Button>
                <Button onClick={handleNextStep}>
                  Continuar a Plan de Acción
                </Button>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Plan de Acción e Implementación
                </h2>
                <p className="text-lg text-muted-foreground">
                  Reporte ejecutivo con roadmap y próximos pasos
                </p>
              </div>

              <ActionPlan 
                selectedUseCases={selectedUseCases}
                evaluatedUseCases={evaluatedUseCases}
              />

              {/* MaturityGauge removed - already shown in validation step */}

              <ExecutiveReportEnhanced 
                selectedUseCases={selectedUseCases}
                evaluatedUseCases={evaluatedUseCases}
                globalAnswers={globalAnswers}
                maturityScore={maturityScore}
                maturityLevel={maturityLevel}
              />

              <div className="flex justify-between max-w-4xl mx-auto">
                <Button onClick={handlePreviousStep} variant="outline">
                  Volver a Priorización
                </Button>
                <Button onClick={handleFinishFramework} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Finalizar y Crear Iniciativa
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Use Case Detail Dialog */}
      <UseCaseDetailDialog
        useCase={selectedUseCaseDetail}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />

      <Footer />
    </div>
  );
};

export default Index;
