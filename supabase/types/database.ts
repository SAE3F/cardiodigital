export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      guias: {
        Row: any
        Insert: any
        Update: any
      }
      algoritmos: {
        Row: any
        Insert: any
        Update: any
      }
      calculadoras: {
        Row: any
        Insert: any
        Update: any
      }
      dosis_farmacos: {
        Row: any
        Insert: any
        Update: any
      }
      scores_riesgo: {
        Row: any
        Insert: any
        Update: any
      }
      profiles: {
        Row: any
        Insert: any
        Update: any
      }
    }
    Views: {
      busqueda_unificada: {
        Row: any
      }
    }
    Functions: {
      buscar: {
        Args: { query: string }
        Returns: any[]
      }
    }
    Enums: {
      sociedad_source: 'SAC' | 'AHA' | 'ESC' | 'ACC' | 'ACC_AHA' | 'ILCOR' | 'LOCAL'
      guia_categoria: 'arritmias' | 'coronario' | 'insuficiencia_cardiaca' | 'emergencias' | 'farmacologia' | 'procedimientos' | 'hipertension' | 'anticoagulacion'
      nivel_evidencia: 'IA' | 'IB' | 'IC' | 'IIA' | 'IIB' | 'III'
      rol_usuario: 'medico_residente' | 'medico_staff' | 'estudiante' | 'admin'
    }
  }
}
