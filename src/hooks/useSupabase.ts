import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Tables = Database['public']['Tables']
type Profiles = Tables['profiles']['Row']
type Consultorios = Tables['consultorios']['Row']
type Reservas = Tables['reservas']['Row']
type Favoritos = Tables['favoritos']['Row']
type Calificaciones = Tables['calificaciones']['Row']

export function useSupabase() {
  // Funciones para perfiles
  const getProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  }, [])

  const updateProfile = useCallback(async (userId: string, updates: Partial<Profiles>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  }, [])

  // Funciones para consultorios
  const getConsultorios = useCallback(async (filters?: {
    ciudad?: string
    estado?: string
    precio_min?: number
    precio_max?: number
    capacidad?: number
  }) => {
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
    return { data, error }
  }, [])

  const getConsultorio = useCallback(async (id: string) => {
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
  }, [])

  const createConsultorio = useCallback(async (consultorio: Omit<Consultorios, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('consultorios')
      .insert(consultorio)
      .select()
      .single()
    return { data, error }
  }, [])

  const updateConsultorio = useCallback(async (id: string, updates: Partial<Consultorios>) => {
    const { data, error } = await supabase
      .from('consultorios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }, [])

  const deleteConsultorio = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('consultorios')
      .delete()
      .eq('id', id)
    return { error }
  }, [])

  // Funciones para reservas
  const getReservas = useCallback(async (userId: string) => {
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
    return { data, error }
  }, [])

  const createReserva = useCallback(async (reserva: Omit<Reservas, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('reservas')
      .insert(reserva)
      .select()
      .single()
    return { data, error }
  }, [])

  const updateReserva = useCallback(async (id: string, updates: Partial<Reservas>) => {
    const { data, error } = await supabase
      .from('reservas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }, [])

  // Funciones para favoritos
  const getFavoritos = useCallback(async (userId: string) => {
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
    return { data, error }
  }, [])

  const addFavorito = useCallback(async (userId: string, consultorioId: string) => {
    const { data, error } = await supabase
      .from('favoritos')
      .insert({
        profesional_id: userId,
        consultorio_id: consultorioId
      })
      .select()
      .single()
    return { data, error }
  }, [])

  const removeFavorito = useCallback(async (userId: string, consultorioId: string) => {
    const { error } = await supabase
      .from('favoritos')
      .delete()
      .eq('profesional_id', userId)
      .eq('consultorio_id', consultorioId)
    return { error }
  }, [])

  const isFavorito = useCallback(async (userId: string, consultorioId: string) => {
    const { data, error } = await supabase
      .from('favoritos')
      .select('id')
      .eq('profesional_id', userId)
      .eq('consultorio_id', consultorioId)
      .single()
    return { isFavorito: !!data, error }
  }, [])

  // Funciones para calificaciones
  const getCalificaciones = useCallback(async (consultorioId: string) => {
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
    return { data, error }
  }, [])

  const createCalificacion = useCallback(async (calificacion: Omit<Calificaciones, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('calificaciones')
      .upsert(calificacion, { onConflict: 'consultorio_id,profesional_id' })
      .select()
      .single()
    return { data, error }
  }, [])

  return {
    // Perfiles
    getProfile,
    updateProfile,
    
    // Consultorios
    getConsultorios,
    getConsultorio,
    createConsultorio,
    updateConsultorio,
    deleteConsultorio,
    
    // Reservas
    getReservas,
    createReserva,
    updateReserva,
    
    // Favoritos
    getFavoritos,
    addFavorito,
    removeFavorito,
    isFavorito,
    
    // Calificaciones
    getCalificaciones,
    createCalificacion,
  }
}
