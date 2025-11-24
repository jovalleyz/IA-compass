export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_global: {
        Row: {
          id: string
          industria: string
          pais: string | null
          promedio_madurez: number | null
          top_casos: Json | null
          total_evaluaciones: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          industria: string
          pais?: string | null
          promedio_madurez?: number | null
          top_casos?: Json | null
          total_evaluaciones?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          industria?: string
          pais?: string | null
          promedio_madurez?: number | null
          top_casos?: Json | null
          total_evaluaciones?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      business_units: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string
          industria: string | null
          nombre: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          industria?: string | null
          nombre: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          industria?: string | null
          nombre?: string
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          contexto: Json | null
          id: string
          mensaje_usuario: string
          respuesta_ia: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          contexto?: Json | null
          id?: string
          mensaje_usuario: string
          respuesta_ia?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          contexto?: Json | null
          id?: string
          mensaje_usuario?: string
          respuesta_ia?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          read_at: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          read_at?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant1_id: string
          participant2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant1_id: string
          participant2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant1_id?: string
          participant2_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          casos_score: number | null
          created_at: string | null
          datos_score: number | null
          estrategia_score: number | null
          fecha: string | null
          global_answers: Json | null
          id: string
          nivel_madurez: string | null
          puntaje_total: number | null
          riesgos_score: number | null
          talento_score: number | null
          tecnologia_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          casos_score?: number | null
          created_at?: string | null
          datos_score?: number | null
          estrategia_score?: number | null
          fecha?: string | null
          global_answers?: Json | null
          id?: string
          nivel_madurez?: string | null
          puntaje_total?: number | null
          riesgos_score?: number | null
          talento_score?: number | null
          tecnologia_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          casos_score?: number | null
          created_at?: string | null
          datos_score?: number | null
          estrategia_score?: number | null
          fecha?: string | null
          global_answers?: Json | null
          id?: string
          nivel_madurez?: string | null
          puntaje_total?: number | null
          riesgos_score?: number | null
          talento_score?: number | null
          tecnologia_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_activities: {
        Row: {
          created_at: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          nombre: string
          notas: string | null
          responsable: string | null
          stage_id: string
          status: Database["public"]["Enums"]["activity_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre: string
          notas?: string | null
          responsable?: string | null
          stage_id: string
          status?: Database["public"]["Enums"]["activity_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          responsable?: string | null
          stage_id?: string
          status?: Database["public"]["Enums"]["activity_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_activities_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "initiative_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_collaborators: {
        Row: {
          created_at: string
          estado: Database["public"]["Enums"]["collaboration_status"] | null
          id: string
          initiative_id: string
          invited_by: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estado?: Database["public"]["Enums"]["collaboration_status"] | null
          id?: string
          initiative_id: string
          invited_by: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["collaboration_status"] | null
          id?: string
          initiative_id?: string
          invited_by?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_collaborators_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_comments: {
        Row: {
          contenido: string
          created_at: string
          edited_at: string | null
          id: string
          initiative_id: string
          mentioned_users: string[] | null
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contenido: string
          created_at?: string
          edited_at?: string | null
          id?: string
          initiative_id: string
          mentioned_users?: string[] | null
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contenido?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          initiative_id?: string
          mentioned_users?: string[] | null
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_comments_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "initiative_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_stages: {
        Row: {
          avance: number | null
          created_at: string
          etapa: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          initiative_id: string
          orden: number
          responsable: string | null
          updated_at: string
        }
        Insert: {
          avance?: number | null
          created_at?: string
          etapa: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          initiative_id: string
          orden: number
          responsable?: string | null
          updated_at?: string
        }
        Update: {
          avance?: number | null
          created_at?: string
          etapa?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          initiative_id?: string
          orden?: number
          responsable?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_stages_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      initiatives: {
        Row: {
          created_at: string
          descripcion: string | null
          fecha_cierre_comprometida: string | null
          id: string
          nombre: string
          porcentaje_avance: number | null
          prioridad: Database["public"]["Enums"]["priority_level"]
          puntaje_total: number | null
          recomendacion:
            | Database["public"]["Enums"]["recommendation_type"]
            | null
          status_general: string | null
          unidad_negocio: string | null
          updated_at: string
          use_case_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          fecha_cierre_comprometida?: string | null
          id?: string
          nombre: string
          porcentaje_avance?: number | null
          prioridad?: Database["public"]["Enums"]["priority_level"]
          puntaje_total?: number | null
          recomendacion?:
            | Database["public"]["Enums"]["recommendation_type"]
            | null
          status_general?: string | null
          unidad_negocio?: string | null
          updated_at?: string
          use_case_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          fecha_cierre_comprometida?: string | null
          id?: string
          nombre?: string
          porcentaje_avance?: number | null
          prioridad?: Database["public"]["Enums"]["priority_level"]
          puntaje_total?: number | null
          recomendacion?:
            | Database["public"]["Enums"]["recommendation_type"]
            | null
          status_general?: string | null
          unidad_negocio?: string | null
          updated_at?: string
          use_case_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiatives_use_case_id_fkey"
            columns: ["use_case_id"]
            isOneToOne: false
            referencedRelation: "use_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          contact_email: string
          contact_name: string
          conversation_id: string | null
          created_at: string | null
          id: string
          phone: string | null
          registered: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contact_email: string
          contact_name: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          phone?: string | null
          registered?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contact_email?: string
          contact_name?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          phone?: string | null
          registered?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          leida: boolean | null
          link: string | null
          mensaje: string
          tipo: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leida?: boolean | null
          link?: string | null
          mensaje: string
          tipo: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leida?: boolean | null
          link?: string | null
          mensaje?: string
          tipo?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          cargo: string | null
          created_at: string | null
          email: string
          empresa: string | null
          empresa_visible: boolean | null
          foto_perfil_url: string | null
          framework_completed: boolean | null
          id: string
          is_public: boolean | null
          nombre: string
          notify_on_user_connection: boolean | null
          pais: string | null
          rol: string | null
          sexo: string | null
          telefono: string | null
          unidad_negocio: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          cargo?: string | null
          created_at?: string | null
          email: string
          empresa?: string | null
          empresa_visible?: boolean | null
          foto_perfil_url?: string | null
          framework_completed?: boolean | null
          id: string
          is_public?: boolean | null
          nombre: string
          notify_on_user_connection?: boolean | null
          pais?: string | null
          rol?: string | null
          sexo?: string | null
          telefono?: string | null
          unidad_negocio?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          cargo?: string | null
          created_at?: string | null
          email?: string
          empresa?: string | null
          empresa_visible?: boolean | null
          foto_perfil_url?: string | null
          framework_completed?: boolean | null
          id?: string
          is_public?: boolean | null
          nombre?: string
          notify_on_user_connection?: boolean | null
          pais?: string | null
          rol?: string | null
          sexo?: string | null
          telefono?: string | null
          unidad_negocio?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roadmap: {
        Row: {
          created_at: string | null
          descripcion: string | null
          estado: string | null
          etapa: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          kpi: string | null
          progreso: number | null
          responsable: string | null
          updated_at: string | null
          use_case_id: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          etapa: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          kpi?: string | null
          progreso?: number | null
          responsable?: string | null
          updated_at?: string | null
          use_case_id: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          etapa?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          kpi?: string | null
          progreso?: number | null
          responsable?: string | null
          updated_at?: string | null
          use_case_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_use_case_id_fkey"
            columns: ["use_case_id"]
            isOneToOne: false
            referencedRelation: "use_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      session_analytics: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          ip_address: string | null
          login_time: string
          logout_time: string | null
          region: string | null
          session_duration: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          login_time?: string
          logout_time?: string | null
          region?: string | null
          session_duration?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          login_time?: string
          logout_time?: string | null
          region?: string | null
          session_duration?: unknown
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          cargo_contacto: string | null
          caso_uso: string
          created_at: string
          descripcion: string
          empresa: string
          id: string
          impacto_negocio: string
          industria: string
          logo_url: string | null
          metrica_clave: string
          nombre_contacto: string | null
          pais: string | null
          testimonio: string | null
          updated_at: string
          valor_metrica: string
        }
        Insert: {
          cargo_contacto?: string | null
          caso_uso: string
          created_at?: string
          descripcion: string
          empresa: string
          id?: string
          impacto_negocio: string
          industria: string
          logo_url?: string | null
          metrica_clave: string
          nombre_contacto?: string | null
          pais?: string | null
          testimonio?: string | null
          updated_at?: string
          valor_metrica: string
        }
        Update: {
          cargo_contacto?: string | null
          caso_uso?: string
          created_at?: string
          descripcion?: string
          empresa?: string
          id?: string
          impacto_negocio?: string
          industria?: string
          logo_url?: string | null
          metrica_clave?: string
          nombre_contacto?: string | null
          pais?: string | null
          testimonio?: string | null
          updated_at?: string
          valor_metrica?: string
        }
        Relationships: []
      }
      support_conversations: {
        Row: {
          assigned_admin_id: string | null
          assigned_at: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          id: string
          resolved_at: string | null
          status: string
          subject: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_admin_id?: string | null
          assigned_at?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          resolved_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_admin_id?: string | null
          assigned_at?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          resolved_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_ai: boolean
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_ai?: boolean
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_ai?: boolean
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      use_cases: {
        Row: {
          agentic_tipo: string | null
          alineamiento_estrategico: number | null
          complejidad: string | null
          created_at: string | null
          creator_company: string | null
          descripcion: string | null
          es_personalizado: boolean | null
          esfuerzo: string | null
          estado: string | null
          evaluation_id: string | null
          id: string
          impacto: string | null
          industria: string
          is_user_created: boolean | null
          madurez_gap: number | null
          nivel_madurez_requerido: number | null
          nombre: string
          respuestas: Json | null
          status_case: Database["public"]["Enums"]["case_status"] | null
          tipo_ia: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agentic_tipo?: string | null
          alineamiento_estrategico?: number | null
          complejidad?: string | null
          created_at?: string | null
          creator_company?: string | null
          descripcion?: string | null
          es_personalizado?: boolean | null
          esfuerzo?: string | null
          estado?: string | null
          evaluation_id?: string | null
          id?: string
          impacto?: string | null
          industria: string
          is_user_created?: boolean | null
          madurez_gap?: number | null
          nivel_madurez_requerido?: number | null
          nombre: string
          respuestas?: Json | null
          status_case?: Database["public"]["Enums"]["case_status"] | null
          tipo_ia?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agentic_tipo?: string | null
          alineamiento_estrategico?: number | null
          complejidad?: string | null
          created_at?: string | null
          creator_company?: string | null
          descripcion?: string | null
          es_personalizado?: boolean | null
          esfuerzo?: string | null
          estado?: string | null
          evaluation_id?: string | null
          id?: string
          impacto?: string | null
          industria?: string
          is_user_created?: boolean | null
          madurez_gap?: number | null
          nivel_madurez_requerido?: number | null
          nombre?: string
          respuestas?: Json | null
          status_case?: Database["public"]["Enums"]["case_status"] | null
          tipo_ia?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "use_cases_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "use_cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_role_to_user: {
        Args: {
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: undefined
      }
      create_user_session: {
        Args: {
          p_city?: string
          p_country: string
          p_ip_address: string
          p_region?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      delete_user_and_data: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_all_users_with_roles: {
        Args: never
        Returns: {
          cargo: string
          created_at: string
          email: string
          empresa: string
          id: string
          nombre: string
          pais: string
          rol: string
          roles: string[]
          telefono: string
        }[]
      }
      get_inactive_initiatives: {
        Args: { days_inactive?: number }
        Returns: {
          days_since_update: number
          initiative_id: string
          last_update: string
          nombre: string
          user_email: string
          user_name: string
        }[]
      }
      get_most_active_users: {
        Args: { end_date: string; limit_count?: number; start_date: string }
        Returns: {
          avg_session_duration: unknown
          email: string
          nombre: string
          total_sessions: number
          total_time: unknown
          user_id: string
        }[]
      }
      get_session_stats: {
        Args: { end_date: string; start_date: string }
        Returns: {
          avg_duration: unknown
          date: string
          total_sessions: number
          unique_users: number
        }[]
      }
      get_sessions_by_country: {
        Args: { end_date: string; start_date: string }
        Returns: {
          country: string
          total_sessions: number
          unique_users: number
        }[]
      }
      get_system_stats: {
        Args: never
        Returns: {
          active_collaborations: number
          total_evaluations: number
          total_initiatives: number
          total_use_cases: number
          total_users: number
        }[]
      }
      get_user_initiatives_stats: {
        Args: never
        Returns: {
          email: string
          nombre: string
          total_evaluations: number
          total_initiatives: number
          total_use_cases: number
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      remove_role_from_user: {
        Args: {
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: undefined
      }
      update_analytics_global: { Args: never; Returns: undefined }
      update_session_duration: {
        Args: { p_duration_seconds: number; p_session_id: string }
        Returns: undefined
      }
      update_session_logout: {
        Args: {
          p_duration_seconds: number
          p_logout_timestamp: string
          p_session_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      activity_status:
        | "no_iniciado"
        | "en_progreso"
        | "completado"
        | "bloqueado"
      app_role: "admin" | "moderator" | "user"
      case_status: "en_evaluacion" | "en_ejecucion" | "caso_de_exito"
      collaboration_status: "pendiente" | "aceptado" | "rechazado"
      notification_type:
        | "invitacion_colaboracion"
        | "cambio_estado_iniciativa"
        | "nuevo_caso_exito"
        | "recordatorio_roadmap"
      priority_level: "alta" | "media" | "baja"
      recommendation_type: "implementar_ahora" | "postergar" | "analizar_mas"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_status: [
        "no_iniciado",
        "en_progreso",
        "completado",
        "bloqueado",
      ],
      app_role: ["admin", "moderator", "user"],
      case_status: ["en_evaluacion", "en_ejecucion", "caso_de_exito"],
      collaboration_status: ["pendiente", "aceptado", "rechazado"],
      notification_type: [
        "invitacion_colaboracion",
        "cambio_estado_iniciativa",
        "nuevo_caso_exito",
        "recordatorio_roadmap",
      ],
      priority_level: ["alta", "media", "baja"],
      recommendation_type: ["implementar_ahora", "postergar", "analizar_mas"],
    },
  },
} as const
