import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'professional' | 'owner' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'professional' | 'owner' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'professional' | 'owner' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      consultorios: {
        Row: {
          id: string
          titulo: string
          descripcion: string
          direccion: string
          ciudad: string
          estado: string
          codigo_postal: string
          latitud: number | null
          longitud: number | null
          precio_hora: number
          precio_dia: number
          precio_mes: number
          capacidad: number
          equipamiento: string[]
          horarios_disponibles: string
          imagenes: string[]
          propietario_id: string
          estado_publicacion: 'activo' | 'inactivo' | 'pendiente'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descripcion: string
          direccion: string
          ciudad: string
          estado: string
          codigo_postal: string
          latitud?: number | null
          longitud?: number | null
          precio_hora: number
          precio_dia: number
          precio_mes: number
          capacidad: number
          equipamiento?: string[]
          horarios_disponibles: string
          imagenes?: string[]
          propietario_id: string
          estado_publicacion?: 'activo' | 'inactivo' | 'pendiente'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string
          direccion?: string
          ciudad?: string
          estado?: string
          codigo_postal?: string
          latitud?: number | null
          longitud?: number | null
          precio_hora?: number
          precio_dia?: number
          precio_mes?: number
          capacidad?: number
          equipamiento?: string[]
          horarios_disponibles?: string
          imagenes?: string[]
          propietario_id?: string
          estado_publicacion?: 'activo' | 'inactivo' | 'pendiente'
          created_at?: string
          updated_at?: string
        }
      }
      reservas: {
        Row: {
          id: string
          consultorio_id: string
          profesional_id: string
          fecha_inicio: string
          fecha_fin: string
          duracion_horas: number
          precio_total: number
          estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          consultorio_id: string
          profesional_id: string
          fecha_inicio: string
          fecha_fin: string
          duracion_horas: number
          precio_total: number
          estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          consultorio_id?: string
          profesional_id?: string
          fecha_inicio?: string
          fecha_fin?: string
          duracion_horas?: number
          precio_total?: number
          estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favoritos: {
        Row: {
          id: string
          profesional_id: string
          consultorio_id: string
          created_at: string
        }
        Insert: {
          id?: string
          profesional_id: string
          consultorio_id: string
          created_at?: string
        }
        Update: {
          id?: string
          profesional_id?: string
          consultorio_id?: string
          created_at?: string
        }
      }
      calificaciones: {
        Row: {
          id: string
          consultorio_id: string
          profesional_id: string
          calificacion: number
          comentario: string | null
          created_at: string
        }
        Insert: {
          id?: string
          consultorio_id: string
          profesional_id: string
          calificacion: number
          comentario?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          consultorio_id?: string
          profesional_id?: string
          calificacion?: number
          comentario?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
