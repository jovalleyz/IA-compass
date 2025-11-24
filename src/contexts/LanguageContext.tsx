import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en' | 'pt' | 'it' | 'de' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Navigation
    'nav.framework': 'Framework',
    'nav.benefits': 'Beneficios',
    'nav.successStories': 'Casos de Éxito',
    'nav.statistics': 'Estadísticas',
    'nav.login': 'Iniciar Sesión',
    'nav.logout': 'Cerrar Sesión',
    'nav.profile': 'Perfil',
    'nav.admin': 'Administración',
    'nav.dashboard': 'Panel',
    'nav.initiatives': 'Iniciativas',

    // Common
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.loading': 'Cargando...',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.back': 'Volver',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.finish': 'Finalizar',

    // Profile
    'profile.title': 'Perfil de Usuario',
    'profile.name': 'Nombre',
    'profile.email': 'Correo Electrónico',
    'profile.phone': 'Teléfono',
    'profile.company': 'Empresa',
    'profile.country': 'País',
    'profile.position': 'Cargo',
    'profile.businessUnit': 'Unidad de Negocio',
    'profile.bio': 'Descripción del Perfil',
    'profile.isPublic': 'Perfil Público',
    'profile.isPublicDescription': 'Permite que otros usuarios te agreguen como colaborador',
    'profile.gender': 'Género',
    'profile.male': 'Masculino',
    'profile.female': 'Femenino',
    'profile.other': 'Otro',
    'profile.preferNotToSay': 'Prefiero no decir',

    // Steps
    'steps.diagnosis': 'Diagnóstico',
    'steps.identification': 'Identificación',
    'steps.evaluation': 'Evaluación',
    'steps.validation': 'Validación',
    'steps.prioritization': 'Priorización',
    'steps.roadmap': 'Roadmap',
    'steps.actionPlan': 'Plan de Acción',

    // Home
    'home.hero.title': 'Framework de Madurez de IA Empresarial',
    'home.hero.subtitle': 'Metodología probada para identificar, evaluar y priorizar casos de uso de Inteligencia Artificial que generen valor real para su organización',
    'home.hero.cta': 'Comenzar Evaluación',
    'home.hero.learnMore': 'Conocer más',
    'home.framework.title': '¿Qué es el Framework de Madurez de IA?',
    'home.framework.subtitle': 'Una metodología estructurada basada en las mejores prácticas de McKinsey, Deloitte y BCG',
    'home.framework.diagnosis.title': 'Diagnóstico Estratégico',
    'home.framework.diagnosis.desc': 'Evalúe la madurez actual de su organización en 5 dimensiones clave: estrategia, datos, tecnología, talento y procesos.',
    'home.framework.identification.title': 'Identificación de Casos',
    'home.framework.identification.desc': 'Catálogo curado con más de 100 casos de uso probados en diferentes industrias, adaptados a su contexto específico.',
    'home.framework.prioritization.title': 'Priorización Inteligente',
    'home.framework.prioritization.desc': 'Matriz de impacto vs esfuerzo, análisis de gaps de madurez y roadmap detallado para implementación.',
    'home.benefits.title': '¿Por qué usar este Framework?',
    'home.benefits.subtitle': 'Beneficios comprobados y metodologías de las principales consultoras',
    'home.benefits.time.title': 'Reduce el tiempo de decisión en 60%',
    'home.benefits.time.desc': 'Proceso estructurado que elimina meses de análisis ad-hoc y alinea a stakeholders',
    'home.benefits.roi.title': 'Aumenta el ROI de proyectos IA en 3x',
    'home.benefits.roi.desc': 'Priorización basada en datos que maximiza el retorno de inversión',
    'home.benefits.proven.title': 'Metodología probada en 500+ empresas',
    'home.benefits.proven.desc': 'Basado en frameworks de McKinsey Analytics, Deloitte AI Institute y BCG Gamma',
    'home.stats.title': 'Estadísticas Globales',
    'home.stats.subtitle': 'Datos reales de organizaciones que han usado el framework',
    'home.stats.evaluations': 'Evaluaciones Completadas',
    'home.stats.maturity': 'Madurez Promedio',
    'home.stats.cases': 'Casos de Uso',
    'home.cta.title': '¿Listo para transformar su organización con IA?',
    'home.cta.subtitle': 'Comience su evaluación gratuita hoy y descubra el potencial de la IA en su empresa',
    'home.cta.button': 'Iniciar Evaluación Gratuita',
    'home.footer.rights': '© 2025 OVM Consulting - Todos los derechos reservados',
    'home.footer.terms': 'Términos y Condiciones de Uso',
  },
  en: {
    // Navigation
    'nav.framework': 'Framework',
    'nav.benefits': 'Benefits',
    'nav.successStories': 'Success Stories',
    'nav.statistics': 'Statistics',
    'nav.login': 'Sign In',
    'nav.logout': 'Sign Out',
    'nav.profile': 'Profile',
    'nav.admin': 'Administration',
    'nav.dashboard': 'Dashboard',
    'nav.initiatives': 'Initiatives',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.finish': 'Finish',

    // Profile
    'profile.title': 'User Profile',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.company': 'Company',
    'profile.country': 'Country',
    'profile.position': 'Position',
    'profile.businessUnit': 'Business Unit',
    'profile.bio': 'Profile Description',
    'profile.isPublic': 'Public Profile',
    'profile.isPublicDescription': 'Allow other users to add you as a collaborator',
    'profile.gender': 'Gender',
    'profile.male': 'Male',
    'profile.female': 'Female',
    'profile.other': 'Other',
    'profile.preferNotToSay': 'Prefer not to say',

    // Steps
    'steps.diagnosis': 'Diagnosis',
    'steps.identification': 'Identification',
    'steps.evaluation': 'Evaluation',
    'steps.validation': 'Validation',
    'steps.prioritization': 'Prioritization',
    'steps.roadmap': 'Roadmap',
    'steps.actionPlan': 'Action Plan',

    // Home
    'home.hero.title': 'Enterprise AI Maturity Framework',
    'home.hero.subtitle': 'Proven methodology to identify, evaluate, and prioritize Artificial Intelligence use cases that generate real value for your organization',
    'home.hero.cta': 'Start Assessment',
    'home.hero.learnMore': 'Learn More',
    'home.framework.title': 'What is the AI Maturity Framework?',
    'home.framework.subtitle': 'A structured methodology based on best practices from McKinsey, Deloitte, and BCG',
    'home.framework.diagnosis.title': 'Strategic Diagnosis',
    'home.framework.diagnosis.desc': 'Assess your organization\'s current maturity across 5 key dimensions: strategy, data, technology, talent, and processes.',
    'home.framework.identification.title': 'Case Identification',
    'home.framework.identification.desc': 'Curated catalog with over 100 proven use cases across different industries, adapted to your specific context.',
    'home.framework.prioritization.title': 'Smart Prioritization',
    'home.framework.prioritization.desc': 'Impact vs. effort matrix, maturity gap analysis, and detailed implementation roadmap.',
    'home.benefits.title': 'Why use this Framework?',
    'home.benefits.subtitle': 'Proven benefits and methodologies from top consulting firms',
    'home.benefits.time.title': 'Reduces decision time by 60%',
    'home.benefits.time.desc': 'Structured process that eliminates months of ad-hoc analysis and aligns stakeholders',
    'home.benefits.roi.title': 'Increases AI project ROI by 3x',
    'home.benefits.roi.desc': 'Data-driven prioritization that maximizes return on investment',
    'home.benefits.proven.title': 'Methodology proven in 500+ companies',
    'home.benefits.proven.desc': 'Based on frameworks from McKinsey Analytics, Deloitte AI Institute, and BCG Gamma',
    'home.stats.title': 'Global Statistics',
    'home.stats.subtitle': 'Real data from organizations that have used the framework',
    'home.stats.evaluations': 'Completed Evaluations',
    'home.stats.maturity': 'Average Maturity',
    'home.stats.cases': 'Use Cases',
    'home.cta.title': 'Ready to transform your organization with AI?',
    'home.cta.subtitle': 'Start your free assessment today and discover the potential of AI in your company',
    'home.cta.button': 'Start Free Assessment',
    'home.footer.rights': '© 2025 OVM Consulting - All rights reserved',
    'home.footer.terms': 'Terms and Conditions',
  },
  pt: {
    // Navigation
    'nav.framework': 'Framework',
    'nav.benefits': 'Benefícios',
    'nav.successStories': 'Casos de Sucesso',
    'nav.statistics': 'Estatísticas',
    'nav.login': 'Entrar',
    'nav.logout': 'Sair',
    'nav.profile': 'Perfil',
    'nav.admin': 'Administração',
    'nav.dashboard': 'Painel',
    'nav.initiatives': 'Iniciativas',

    // Common
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.loading': 'Carregando...',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.back': 'Voltar',
    'common.next': 'Próximo',
    'common.previous': 'Anterior',
    'common.finish': 'Finalizar',

    // Profile
    'profile.title': 'Perfil do Usuário',
    'profile.name': 'Nome',
    'profile.email': 'Email',
    'profile.phone': 'Telefone',
    'profile.company': 'Empresa',
    'profile.country': 'País',
    'profile.position': 'Cargo',
    'profile.businessUnit': 'Unidade de Negócio',
    'profile.bio': 'Descrição do Perfil',
    'profile.isPublic': 'Perfil Público',
    'profile.isPublicDescription': 'Permitir que outros usuários adicionem você como colaborador',
    'profile.gender': 'Gênero',
    'profile.male': 'Masculino',
    'profile.female': 'Feminino',
    'profile.other': 'Outro',
    'profile.preferNotToSay': 'Prefiro não dizer',

    // Steps
    'steps.diagnosis': 'Diagnóstico',
    'steps.identification': 'Identificação',
    'steps.evaluation': 'Avaliação',
    'steps.validation': 'Validação',
    'steps.prioritization': 'Priorização',
    'steps.roadmap': 'Roadmap',
    'steps.actionPlan': 'Plano de Ação',

    // Home
    'home.hero.title': 'Framework de Maturidade de IA Empresarial',
    'home.hero.subtitle': 'Metodologia comprovada para identificar, avaliar e priorizar casos de uso de Inteligência Artificial que geram valor real para sua organização',
    'home.hero.cta': 'Iniciar Avaliação',
    'home.hero.learnMore': 'Saiba Mais',
    'home.framework.title': 'O que é o Framework de Maturidade de IA?',
    'home.framework.subtitle': 'Uma metodologia estruturada baseada nas melhores práticas da McKinsey, Deloitte e BCG',
    'home.framework.diagnosis.title': 'Diagnóstico Estratégico',
    'home.framework.diagnosis.desc': 'Avalie a maturidade atual da sua organização em 5 dimensões chave: estratégia, dados, tecnologia, talento e processos.',
    'home.framework.identification.title': 'Identificação de Casos',
    'home.framework.identification.desc': 'Catálogo curado com mais de 100 casos de uso comprovados em diferentes indústrias, adaptados ao seu contexto específico.',
    'home.framework.prioritization.title': 'Priorização Inteligente',
    'home.framework.prioritization.desc': 'Matriz de impacto vs esforço, análise de lacunas de maturidade e roteiro detalhado para implementação.',
    'home.benefits.title': 'Por que usar este Framework?',
    'home.benefits.subtitle': 'Benefícios comprovados e metodologias das principais consultorias',
    'home.benefits.time.title': 'Reduz o tempo de decisão em 60%',
    'home.benefits.time.desc': 'Processo estruturado que elimina meses de análise ad-hoc e alinha as partes interessadas',
    'home.benefits.roi.title': 'Aumenta o ROI de projetos de IA em 3x',
    'home.benefits.roi.desc': 'Priorização baseada em dados que maximiza o retorno sobre o investimento',
    'home.benefits.proven.title': 'Metodologia comprovada em 500+ empresas',
    'home.benefits.proven.desc': 'Baseado em frameworks da McKinsey Analytics, Deloitte AI Institute e BCG Gamma',
    'home.stats.title': 'Estatísticas Globais',
    'home.stats.subtitle': 'Dados reais de organizações que usaram o framework',
    'home.stats.evaluations': 'Avaliações Concluídas',
    'home.stats.maturity': 'Maturidade Média',
    'home.stats.cases': 'Casos de Uso',
    'home.cta.title': 'Pronto para transformar sua organização com IA?',
    'home.cta.subtitle': 'Comece sua avaliação gratuita hoje e descubra o potencial da IA em sua empresa',
    'home.cta.button': 'Iniciar Avaliação Gratuita',
    'home.footer.rights': '© 2025 OVM Consulting - Todos os direitos reservados',
    'home.footer.terms': 'Termos e Condições de Uso',
  },
  it: {
    // Navigation
    'nav.framework': 'Framework',
    'nav.benefits': 'Benefici',
    'nav.successStories': 'Casi di Successo',
    'nav.statistics': 'Statistiche',
    'nav.login': 'Accedi',
    'nav.logout': 'Esci',
    'nav.profile': 'Profilo',
    'nav.admin': 'Amministrazione',
    'nav.dashboard': 'Pannello',
    'nav.initiatives': 'Iniziative',

    // Common
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.delete': 'Elimina',
    'common.edit': 'Modifica',
    'common.loading': 'Caricamento...',
    'common.search': 'Cerca',
    'common.filter': 'Filtra',
    'common.export': 'Esporta',
    'common.back': 'Indietro',
    'common.next': 'Avanti',
    'common.previous': 'Precedente',
    'common.finish': 'Fine',

    // Profile
    'profile.title': 'Profilo Utente',
    'profile.name': 'Nome',
    'profile.email': 'Email',
    'profile.phone': 'Telefono',
    'profile.company': 'Azienda',
    'profile.country': 'Paese',
    'profile.position': 'Posizione',
    'profile.businessUnit': 'Unità di Business',
    'profile.bio': 'Descrizione del Profilo',
    'profile.isPublic': 'Profilo Pubblico',
    'profile.isPublicDescription': 'Consenti ad altri utenti di aggiungerti come collaboratore',
    'profile.gender': 'Genere',
    'profile.male': 'Maschile',
    'profile.female': 'Femminile',
    'profile.other': 'Altro',
    'profile.preferNotToSay': 'Preferisco non dire',

    // Steps
    'steps.diagnosis': 'Diagnosi',
    'steps.identification': 'Identificazione',
    'steps.evaluation': 'Valutazione',
    'steps.validation': 'Validazione',
    'steps.prioritization': 'Prioritizzazione',
    'steps.roadmap': 'Roadmap',
    'steps.actionPlan': 'Piano d\'Azione',

    // Home
    'home.hero.title': 'Framework di Maturità AI Aziendale',
    'home.hero.subtitle': 'Metodologia comprovata per identificare, valutare e dare priorità ai casi d\'uso dell\'Intelligenza Artificiale che generano valore reale per la tua organizzazione',
    'home.hero.cta': 'Inizia Valutazione',
    'home.hero.learnMore': 'Saperne di più',
    'home.framework.title': 'Cos\'è il Framework di Maturità AI?',
    'home.framework.subtitle': 'Una metodologia strutturata basata sulle migliori pratiche di McKinsey, Deloitte e BCG',
    'home.framework.diagnosis.title': 'Diagnosi Strategica',
    'home.framework.diagnosis.desc': 'Valuta la maturità attuale della tua organizzazione in 5 dimensioni chiave: strategia, dati, tecnologia, talento e processi.',
    'home.framework.identification.title': 'Identificazione dei Casi',
    'home.framework.identification.desc': 'Catalogo curato con oltre 100 casi d\'uso comprovati in diversi settori, adattati al tuo contesto specifico.',
    'home.framework.prioritization.title': 'Prioritizzazione Intelligente',
    'home.framework.prioritization.desc': 'Matrice impatto vs sforzo, analisi dei gap di maturità e roadmap dettagliata per l\'implementazione.',
    'home.benefits.title': 'Perché usare questo Framework?',
    'home.benefits.subtitle': 'Benefici comprovati e metodologie delle principali società di consulenza',
    'home.benefits.time.title': 'Riduce il tempo decisionale del 60%',
    'home.benefits.time.desc': 'Processo strutturato che elimina mesi di analisi ad-hoc e allinea gli stakeholder',
    'home.benefits.roi.title': 'Aumenta il ROI dei progetti AI di 3x',
    'home.benefits.roi.desc': 'Prioritizzazione basata sui dati che massimizza il ritorno sull\'investimento',
    'home.benefits.proven.title': 'Metodologia comprovata in 500+ aziende',
    'home.benefits.proven.desc': 'Basato su framework di McKinsey Analytics, Deloitte AI Institute e BCG Gamma',
    'home.stats.title': 'Statistiche Globali',
    'home.stats.subtitle': 'Dati reali da organizzazioni che hanno utilizzato il framework',
    'home.stats.evaluations': 'Valutazioni Completate',
    'home.stats.maturity': 'Maturità Media',
    'home.stats.cases': 'Casi d\'Uso',
    'home.cta.title': 'Pronto a trasformare la tua organizzazione con l\'IA?',
    'home.cta.subtitle': 'Inizia oggi la tua valutazione gratuita e scopri il potenziale dell\'IA nella tua azienda',
    'home.cta.button': 'Inizia Valutazione Gratuita',
    'home.footer.rights': '© 2025 OVM Consulting - Tutti i diritti riservati',
    'home.footer.terms': 'Termini e Condizioni d\'Uso',
  },
  de: {
    // Navigation
    'nav.framework': 'Framework',
    'nav.benefits': 'Vorteile',
    'nav.successStories': 'Erfolgsgeschichten',
    'nav.statistics': 'Statistiken',
    'nav.login': 'Anmelden',
    'nav.logout': 'Abmelden',
    'nav.profile': 'Profil',
    'nav.admin': 'Verwaltung',
    'nav.dashboard': 'Dashboard',
    'nav.initiatives': 'Initiativen',

    // Common
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.loading': 'Laden...',
    'common.search': 'Suchen',
    'common.filter': 'Filtern',
    'common.export': 'Exportieren',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.previous': 'Vorherige',
    'common.finish': 'Beenden',

    // Profile
    'profile.title': 'Benutzerprofil',
    'profile.name': 'Name',
    'profile.email': 'E-Mail',
    'profile.phone': 'Telefon',
    'profile.company': 'Unternehmen',
    'profile.country': 'Land',
    'profile.position': 'Position',
    'profile.businessUnit': 'Geschäftsbereich',
    'profile.bio': 'Profilbeschreibung',
    'profile.isPublic': 'Öffentliches Profil',
    'profile.isPublicDescription': 'Anderen Benutzern erlauben, Sie als Mitarbeiter hinzuzufügen',
    'profile.gender': 'Geschlecht',
    'profile.male': 'Männlich',
    'profile.female': 'Weiblich',
    'profile.other': 'Andere',
    'profile.preferNotToSay': 'Möchte ich nicht sagen',

    // Steps
    'steps.diagnosis': 'Diagnose',
    'steps.identification': 'Identifizierung',
    'steps.evaluation': 'Bewertung',
    'steps.validation': 'Validierung',
    'steps.prioritization': 'Priorisierung',
    'steps.roadmap': 'Roadmap',
    'steps.actionPlan': 'Aktionsplan',

    // Home
    'home.hero.title': 'Unternehmens-KI-Reifegrad-Framework',
    'home.hero.subtitle': 'Bewährte Methodik zur Identifizierung, Bewertung und Priorisierung von KI-Anwendungsfällen, die echten Mehrwert für Ihr Unternehmen schaffen',
    'home.hero.cta': 'Bewertung Starten',
    'home.hero.learnMore': 'Mehr erfahren',
    'home.framework.title': 'Was ist das KI-Reifegrad-Framework?',
    'home.framework.subtitle': 'Eine strukturierte Methodik basierend auf Best Practices von McKinsey, Deloitte und BCG',
    'home.framework.diagnosis.title': 'Strategische Diagnose',
    'home.framework.diagnosis.desc': 'Bewerten Sie den aktuellen Reifegrad Ihrer Organisation in 5 Schlüsseldimensionen: Strategie, Daten, Technologie, Talent und Prozesse.',
    'home.framework.identification.title': 'Fallidentifikation',
    'home.framework.identification.desc': 'Kuratierter Katalog mit über 100 bewährten Anwendungsfällen in verschiedenen Branchen, angepasst an Ihren spezifischen Kontext.',
    'home.framework.prioritization.title': 'Intelligente Priorisierung',
    'home.framework.prioritization.desc': 'Impact-vs-Effort-Matrix, Reifegrad-Lückenanalyse und detaillierte Implementierungs-Roadmap.',
    'home.benefits.title': 'Warum dieses Framework verwenden?',
    'home.benefits.subtitle': 'Bewährte Vorteile und Methoden führender Beratungsunternehmen',
    'home.benefits.time.title': 'Reduziert die Entscheidungszeit um 60%',
    'home.benefits.time.desc': 'Strukturierter Prozess, der Monate von Ad-hoc-Analysen eliminiert und Stakeholder aufeinander abstimmt',
    'home.benefits.roi.title': 'Erhöht den ROI von KI-Projekten um das 3-fache',
    'home.benefits.roi.desc': 'Datengetriebene Priorisierung, die den Return on Investment maximiert',
    'home.benefits.proven.title': 'Methodik in 500+ Unternehmen bewährt',
    'home.benefits.proven.desc': 'Basierend auf Frameworks von McKinsey Analytics, Deloitte AI Institute und BCG Gamma',
    'home.stats.title': 'Globale Statistiken',
    'home.stats.subtitle': 'Echte Daten von Organisationen, die das Framework genutzt haben',
    'home.stats.evaluations': 'Abgeschlossene Bewertungen',
    'home.stats.maturity': 'Durchschnittlicher Reifegrad',
    'home.stats.cases': 'Anwendungsfälle',
    'home.cta.title': 'Bereit, Ihre Organisation mit KI zu transformieren?',
    'home.cta.subtitle': 'Starten Sie Ihre kostenlose Bewertung heute und entdecken Sie das Potenzial von KI in Ihrem Unternehmen',
    'home.cta.button': 'Kostenlose Bewertung Starten',
    'home.footer.rights': '© 2025 OVM Consulting - Alle Rechte vorbehalten',
    'home.footer.terms': 'Nutzungsbedingungen',
  },
  fr: {
    // Navigation
    'nav.framework': 'Framework',
    'nav.benefits': 'Avantages',
    'nav.successStories': 'Cas de Succès',
    'nav.statistics': 'Statistiques',
    'nav.login': 'Se Connecter',
    'nav.logout': 'Se Déconnecter',
    'nav.profile': 'Profil',
    'nav.admin': 'Administration',
    'nav.dashboard': 'Tableau de Bord',
    'nav.initiatives': 'Initiatives',

    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.loading': 'Chargement...',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.finish': 'Terminer',

    // Profile
    'profile.title': 'Profil Utilisateur',
    'profile.name': 'Nom',
    'profile.email': 'Email',
    'profile.phone': 'Téléphone',
    'profile.company': 'Entreprise',
    'profile.country': 'Pays',
    'profile.position': 'Poste',
    'profile.businessUnit': 'Unité d\'Affaires',
    'profile.bio': 'Description du Profil',
    'profile.isPublic': 'Profil Public',
    'profile.isPublicDescription': 'Permettre aux autres utilisateurs de vous ajouter comme collaborateur',
    'profile.gender': 'Genre',
    'profile.male': 'Masculin',
    'profile.female': 'Féminin',
    'profile.other': 'Autre',
    'profile.preferNotToSay': 'Je préfère ne pas dire',

    // Steps
    'steps.diagnosis': 'Diagnostic',
    'steps.identification': 'Identification',
    'steps.evaluation': 'Évaluation',
    'steps.validation': 'Validation',
    'steps.prioritization': 'Priorisation',
    'steps.roadmap': 'Roadmap',
    'steps.actionPlan': 'Plan d\'Action',

    // Home
    'home.hero.title': 'Cadre de Maturité IA d\'Entreprise',
    'home.hero.subtitle': 'Méthodologie éprouvée pour identifier, évaluer et prioriser les cas d\'usage de l\'Intelligence Artificielle qui génèrent une valeur réelle pour votre organisation',
    'home.hero.cta': 'Commencer l\'Évaluation',
    'home.hero.learnMore': 'En savoir plus',
    'home.framework.title': 'Qu\'est-ce que le Cadre de Maturité IA ?',
    'home.framework.subtitle': 'Une méthodologie structurée basée sur les meilleures pratiques de McKinsey, Deloitte et BCG',
    'home.framework.diagnosis.title': 'Diagnostic Stratégique',
    'home.framework.diagnosis.desc': 'Évaluez la maturité actuelle de votre organisation dans 5 dimensions clés : stratégie, données, technologie, talent et processus.',
    'home.framework.identification.title': 'Identification des Cas',
    'home.framework.identification.desc': 'Catalogue organisé avec plus de 100 cas d\'usage éprouvés dans différentes industries, adaptés à votre contexte spécifique.',
    'home.framework.prioritization.title': 'Priorisation Intelligente',
    'home.framework.prioritization.desc': 'Matrice impact vs effort, analyse des écarts de maturité et feuille de route détaillée pour la mise en œuvre.',
    'home.benefits.title': 'Pourquoi utiliser ce Cadre ?',
    'home.benefits.subtitle': 'Avantages éprouvés et méthodologies des principaux cabinets de conseil',
    'home.benefits.time.title': 'Réduit le temps de décision de 60%',
    'home.benefits.time.desc': 'Processus structuré qui élimine des mois d\'analyse ad-hoc et aligne les parties prenantes',
    'home.benefits.roi.title': 'Augmente le ROI des projets IA de 3x',
    'home.benefits.roi.desc': 'Priorisation basée sur les données qui maximise le retour sur investissement',
    'home.benefits.proven.title': 'Méthodologie éprouvée dans 500+ entreprises',
    'home.benefits.proven.desc': 'Basé sur les cadres de McKinsey Analytics, Deloitte AI Institute et BCG Gamma',
    'home.stats.title': 'Statistiques Mondiales',
    'home.stats.subtitle': 'Données réelles d\'organisations ayant utilisé le cadre',
    'home.stats.evaluations': 'Évaluations Terminées',
    'home.stats.maturity': 'Maturité Moyenne',
    'home.stats.cases': 'Cas d\'Usage',
    'home.cta.title': 'Prêt à transformer votre organisation avec l\'IA ?',
    'home.cta.subtitle': 'Commencez votre évaluation gratuite aujourd\'hui et découvrez le potentiel de l\'IA dans votre entreprise',
    'home.cta.button': 'Commencer l\'Évaluation Gratuite',
    'home.footer.rights': '© 2025 OVM Consulting - Tous droits réservés',
    'home.footer.terms': 'Conditions Générales d\'Utilisation',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'es';
  });

  useEffect(() => {
    // Attempt geolocation-based language detection on first load
    const detectLanguage = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code?.toLowerCase();

        const countryToLanguage: Record<string, Language> = {
          'es': 'es', 'mx': 'es', 'ar': 'es', 'co': 'es', 'cl': 'es', 've': 'es', 'pe': 'es',
          'us': 'en', 'gb': 'en', 'ca': 'en', 'au': 'en', 'nz': 'en',
          'br': 'pt', 'pt': 'pt',
          'it': 'it',
          'de': 'de', 'at': 'de', 'ch': 'de',
          'fr': 'fr', 'be': 'fr', 'lu': 'fr',
        };

        const detectedLang = countryToLanguage[countryCode] || 'es';
        if (!localStorage.getItem('language')) {
          setLanguage(detectedLang);
        }
      } catch (error) {
        console.log('Could not detect language from location');
      }
    };

    detectLanguage();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
