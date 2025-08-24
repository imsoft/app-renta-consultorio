import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Tables = Database['public']['Tables']
type Consultorios = Tables['consultorios']['Row']
type Reservas = Tables['reservas']['Row']
type Favoritos = Tables['favoritos']['Row']
type Calificaciones = Tables['calificaciones']['Row']

interface UserData {
  nombre: string
  apellidos: string
  role?: 'professional' | 'owner' | 'admin'
}

interface ProfileUpdates {
  nombre: string
  apellidos: string
  avatar?: string | null
}

interface ConsultorioFilters {
  ciudad?: string
  estado?: string
  precio_min?: number
  precio_max?: number
  capacidad?: number
}

interface SupabaseState {
  // Estado de autenticación
  user: User | null
  session: Session | null
  loading: boolean
  
  // Datos de la aplicación
  consultorios: Consultorios[]
  reservas: Reservas[]
  favoritos: Favoritos[]
  calificaciones: Calificaciones[]
  
  // Funciones de autenticación
  signIn: (email: string, password: string) => Promise<{ error: unknown }>
  signUp: (email: string, password: string, userData: UserData) => Promise<{ error: unknown }>
  signOut: () => Promise<void>
  updateProfile: (updates: ProfileUpdates) => Promise<{ error: unknown }>
  
  // Funciones de datos
  getConsultorios: (filters?: ConsultorioFilters) => Promise<{ data: Consultorios[] | null, error: unknown }>
  getConsultorio: (id: string) => Promise<{ data: Consultorios | null, error: unknown }>
  createConsultorio: (consultorio: Omit<Consultorios, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: Consultorios | null, error: unknown }>
  updateConsultorio: (id: string, updates: Partial<Consultorios>) => Promise<{ data: Consultorios | null, error: unknown }>
  deleteConsultorio: (id: string) => Promise<{ error: unknown }>
  
  getReservas: (userId: string) => Promise<{ data: Reservas[] | null, error: unknown }>
  createReserva: (reserva: Omit<Reservas, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: Reservas | null, error: unknown }>
  updateReserva: (id: string, updates: Partial<Reservas>) => Promise<{ data: Reservas | null, error: unknown }>
  
  getFavoritos: (userId: string) => Promise<{ data: Favoritos[] | null, error: unknown }>
  addFavorito: (userId: string, consultorioId: string) => Promise<{ data: Favoritos | null, error: unknown }>
  removeFavorito: (userId: string, consultorioId: string) => Promise<{ error: unknown }>
  isFavorito: (userId: string, consultorioId: string) => Promise<{ isFavorito: boolean, error: unknown }>
  
  getCalificaciones: (consultorioId: string) => Promise<{ data: Calificaciones[] | null, error: unknown }>
  createCalificacion: (calificacion: Omit<Calificaciones, 'id' | 'created_at'>) => Promise<{ data: Calificaciones | null, error: unknown }>
  
  // Funciones de estado
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

export const useSupabaseStore = create<SupabaseState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      session: null,
      loading: true,
      consultorios: [],
      reservas: [],
      favoritos: [],
      calificaciones: [],

      // Funciones de autenticación
      signIn: async (email: string, password: string) => {
        set({ loading: true })
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        set({ loading: false })
        return { error }
      },

      signUp: async (email: string, password: string, userData: UserData) => {
        set({ loading: true })
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: `${userData.nombre} ${userData.apellidos}`,
              role: userData.role || 'professional',
            }
          }
        })
        set({ loading: false })
        return { error }
      },

      signOut: async () => {
        set({ loading: true })
        await supabase.auth.signOut()
        set({ 
          user: null, 
          session: null, 
          loading: false,
          consultorios: [],
          reservas: [],
          favoritos: [],
          calificaciones: []
        })
      },

      updateProfile: async (updates: ProfileUpdates) => {
        const { user } = get()
        if (!user) return { error: new Error('No user logged in') }
        
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: `${updates.nombre} ${updates.apellidos}`,
            avatar_url: updates.avatar,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
        
        return { error }
      },

      // Funciones de consultorios
      getConsultorios: async (filters?: ConsultorioFilters) => {
        let query = supabase
          .from('consultorios')
          .select(`
            *,
            profiles!consultorios_propietario_id_fkey (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('estado_publicacion', 'activo')

        if (filters?.ciudad) {
          query = query.eq('ciudad', filters.ciudad)
        }
        if (filters?.estado) {
          query = query.eq('estado', filters.estado)
        }
        if (filters?.precio_min) {
          query = query.gte('precio_hora', filters.precio_min)
        }
        if (filters?.precio_max) {
          query = query.lte('precio_hora', filters.precio_max)
        }
        if (filters?.capacidad) {
          query = query.gte('capacidad', filters.capacidad)
        }

        const { data, error } = await query
        if (data) {
          set({ consultorios: data })
        }
        return { data, error }
      },

      getConsultorio: async (id: string) => {
        const { data, error } = await supabase
          .from('consultorios')
          .select(`
            *,
            profiles!consultorios_propietario_id_fkey (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single()
        return { data, error }
      },

      createConsultorio: async (consultorio: Omit<Consultorios, 'id' | 'created_at' | 'updated_at'>) => {
        const { data, error } = await supabase
          .from('consultorios')
          .insert(consultorio)
          .select()
          .single()
        return { data, error }
      },

      updateConsultorio: async (id: string, updates: Partial<Consultorios>) => {
        const { data, error } = await supabase
          .from('consultorios')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        return { data, error }
      },

      deleteConsultorio: async (id: string) => {
        const { error } = await supabase
          .from('consultorios')
          .delete()
          .eq('id', id)
        return { error }
      },

      // Funciones de reservas
      getReservas: async (userId: string) => {
        const { data, error } = await supabase
          .from('reservas')
          .select(`
            *,
            consultorios (
              id,
              titulo,
              direccion,
              ciudad,
              estado
            )
          `)
          .eq('profesional_id', userId)
          .order('created_at', { ascending: false })
        
        if (data) {
          set({ reservas: data })
        }
        return { data, error }
      },

      createReserva: async (reserva: Omit<Reservas, 'id' | 'created_at' | 'updated_at'>) => {
        const { data, error } = await supabase
          .from('reservas')
          .insert(reserva)
          .select()
          .single()
        return { data, error }
      },

      updateReserva: async (id: string, updates: Partial<Reservas>) => {
        const { data, error } = await supabase
          .from('reservas')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        return { data, error }
      },

      // Funciones de favoritos
      getFavoritos: async (userId: string) => {
        const { data, error } = await supabase
          .from('favoritos')
          .select(`
            *,
            consultorios (
              id,
              titulo,
              descripcion,
              direccion,
              ciudad,
              estado,
              precio_hora,
              imagenes
            )
          `)
          .eq('profesional_id', userId)
        
        if (data) {
          set({ favoritos: data })
        }
        return { data, error }
      },

      addFavorito: async (userId: string, consultorioId: string) => {
        const { data, error } = await supabase
          .from('favoritos')
          .insert({
            profesional_id: userId,
            consultorio_id: consultorioId
          })
          .select()
          .single()
        return { data, error }
      },

      removeFavorito: async (userId: string, consultorioId: string) => {
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('profesional_id', userId)
          .eq('consultorio_id', consultorioId)
        return { error }
      },

      isFavorito: async (userId: string, consultorioId: string) => {
        const { data, error } = await supabase
          .from('favoritos')
          .select('id')
          .eq('profesional_id', userId)
          .eq('consultorio_id', consultorioId)
          .single()
        return { isFavorito: !!data, error }
      },

      // Funciones de calificaciones
      getCalificaciones: async (consultorioId: string) => {
        const { data, error } = await supabase
          .from('calificaciones')
          .select(`
            *,
            profiles (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('consultorio_id', consultorioId)
          .order('created_at', { ascending: false })
        
        if (data) {
          set({ calificaciones: data })
        }
        return { data, error }
      },

      createCalificacion: async (calificacion: Omit<Calificaciones, 'id' | 'created_at'>) => {
        const { data, error } = await supabase
          .from('calificaciones')
          .upsert(calificacion, { onConflict: 'consultorio_id,profesional_id' })
          .select()
          .single()
        return { data, error }
      },

      // Funciones de estado
      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) => set({ session }),
      setLoading: (loading: boolean) => set({ loading }),
      clearAuth: () => set({ 
        user: null, 
        session: null,
        consultorios: [],
        reservas: [],
        favoritos: [],
        calificaciones: []
      }),
    }),
    {
      name: 'wellpoint-supabase',
      partialize: (state) => ({ 
        user: state.user,
        session: state.session,
      }),
    }
  )
)
