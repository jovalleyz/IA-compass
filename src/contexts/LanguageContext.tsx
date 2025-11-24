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
