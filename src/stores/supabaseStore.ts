import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { supabase, uploadConsultorioImage } from '@/lib/supabase'

// Tipos de base de datos (actualizados según las migraciones)
interface Profile {
  id: string
  email: string
  full_name?: string
  nombre?: string
  apellidos?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  estado?: string
  codigo_postal?: string
  fecha_nacimiento?: string
  especialidad?: string
  cedula_profesional?: string
  biografia?: string
  avatar_url?: string
  role: 'user' | 'admin'
  verificado: boolean
  activo: boolean
  created_at: string
  updated_at: string
}

interface Consultorio {
  id: string
  propietario_id: string
  titulo: string
  descripcion?: string
  direccion: string
  ciudad: string
  estado: string
  codigo_postal?: string
  coordenadas?: string
  precio_por_hora: number
  precio_por_dia?: number
  precio_por_mes?: number
  metros_cuadrados?: number
  numero_consultorios: number
  equipamiento?: string[]
  servicios?: string[]
  especialidades?: string[]
  horario_apertura?: string
  horario_cierre?: string
  dias_disponibles?: string[]
  activo: boolean
  aprobado: boolean
  destacado: boolean
  permite_mascotas: boolean
  estacionamiento: boolean
  wifi: boolean
  aire_acondicionado: boolean
  imagenes?: string[]
  imagen_principal?: string
  calificacion_promedio: number
  total_calificaciones: number
  total_reservas: number
  vistas: number
  created_at: string
  updated_at: string
}

interface Reserva {
  id: string
  consultorio_id: string
  usuario_id: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  tipo_reserva: 'hora' | 'dia' | 'mes'
  precio_por_unidad: number
  unidades: number
  descuento: number
  subtotal: number
  impuestos: number
  total: number
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'en_progreso'
  notas_usuario?: string
  notas_propietario?: string
  motivo_cancelacion?: string
  metodo_pago?: string
  referencia_pago?: string
  fecha_pago?: string
  fecha_confirmacion?: string
  fecha_cancelacion?: string
  created_at: string
  updated_at: string
}

interface Favorito {
  id: string
  usuario_id: string
  consultorio_id: string
  created_at: string
}

interface Calificacion {
  id: string
  consultorio_id: string
  usuario_id: string
  reserva_id?: string
  puntuacion: number
  comentario?: string
  limpieza?: number
  ubicacion?: number
  equipamiento?: number
  atencion?: number
  relacion_precio?: number
  respuesta_propietario?: string
  fecha_respuesta?: string
  activo: boolean
  reportado: boolean
  created_at: string
  updated_at: string
}

// Interfaces para crear/actualizar
interface UserData {
  nombre: string
  apellidos: string
  role?: 'user' | 'admin'
}

interface ProfileUpdates {
  nombre?: string
  apellidos?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  estado?: string
  especialidad?: string
  biografia?: string
  avatar_url?: string
}

interface ConsultorioCreate {
  titulo: string
  descripcion?: string
  direccion: string
  ciudad: string
  estado: string
  codigo_postal?: string
  precio_por_hora: number
  precio_por_dia?: number
  precio_por_mes?: number
  metros_cuadrados?: number
  numero_consultorios?: number
  equipamiento?: string[]
  servicios?: string[]
  especialidades?: string[]
  horario_apertura?: string
  horario_cierre?: string
  dias_disponibles?: string[]
  permite_mascotas?: boolean
  estacionamiento?: boolean
  wifi?: boolean
  aire_acondicionado?: boolean
  imagenes?: string[]
  imagen_principal?: string
}

interface ConsultorioFilters {
  ciudad?: string
  estado?: string
  precio_min?: number
  precio_max?: number
  metros_cuadrados?: number
  especialidades?: string[]
  servicios?: string[]
  equipamiento?: string[]
}

interface ReservaCreate {
  consultorio_id: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  tipo_reserva: 'hora' | 'dia' | 'mes'
  precio_por_unidad: number
  unidades: number
  descuento?: number
  subtotal: number
  impuestos?: number
  total: number
  notas_usuario?: string
}

interface CalificacionCreate {
  consultorio_id: string
  reserva_id?: string
  puntuacion: number
  comentario?: string
  limpieza?: number
  ubicacion?: number
  equipamiento?: number
  atencion?: number
  relacion_precio?: number
}

interface UserStats {
  // Estadísticas de usuario
  reservasRealizadas: number
  consultoriosVisitados: number
  totalGastado: number
  favoritosCount: number
  
  // Estadísticas de propietario (si aplica)
  consultoriosRegistrados: number
  totalReservasRecibidas: number
  ingresosTotales: number
  calificacionPromedio: number
  reseñasRecibidas: number
}

interface ConsultorioStats {
  totalReservas: number
  calificacionPromedio: number
  vistas: number
  ingresosTotales: number
  reservasEsteMes: number
  totalCalificaciones: number
}

interface SupabaseState {
  // Estado de autenticación
  user: User | null
  session: Session | null
  loading: boolean
  
  // Datos de la aplicación
  profile: Profile | null
  consultorios: Consultorio[]
  reservas: Reserva[]
  favoritos: Favorito[]
  calificaciones: Calificacion[]
  
  // Funciones de autenticación
  signIn: (email: string, password: string) => Promise<{ error: unknown }>
  signUp: (email: string, password: string, userData: UserData) => Promise<{ error: unknown }>
  signInWithGoogle: () => Promise<{ error: unknown }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: unknown }>
  confirmEmail: (token: string) => Promise<{ error: unknown }>
  
  // Funciones de perfil
  getProfile: (id?: string) => Promise<{ data: Profile | null, error: unknown }>
  updateProfile: (updates: ProfileUpdates) => Promise<{ error: unknown }>
  
  // Funciones de consultorios
  getConsultorios: (filters?: ConsultorioFilters) => Promise<{ data: Consultorio[] | null, error: unknown }>
  getConsultorio: (id: string) => Promise<{ data: Consultorio | null, error: unknown }>
  getMyConsultorios: () => Promise<{ data: Consultorio[] | null, error: unknown }>
  createConsultorio: (consultorio: ConsultorioCreate) => Promise<{ data: Consultorio | null, error: unknown }>
  updateConsultorio: (id: string, updates: Partial<ConsultorioCreate>) => Promise<{ data: Consultorio | null, error: unknown }>
  deleteConsultorio: (id: string) => Promise<{ error: unknown }>
  toggleConsultorioStatus: (id: string, activo: boolean) => Promise<{ error: unknown }>
  
  // Funciones de reservas
  getReservas: (userId?: string) => Promise<{ data: Reserva[] | null, error: unknown }>
  getReservasByConsultorio: (consultorioId: string) => Promise<{ data: Reserva[] | null, error: unknown }>
  createReserva: (reserva: ReservaCreate) => Promise<{ data: Reserva | null, error: unknown }>
  updateReserva: (id: string, updates: Partial<Reserva>) => Promise<{ data: Reserva | null, error: unknown }>
  cancelReserva: (id: string, motivo?: string) => Promise<{ error: unknown }>
  confirmarReserva: (id: string) => Promise<{ error: unknown }>
  
  // Funciones de favoritos
  getFavoritos: (userId?: string) => Promise<{ data: Favorito[] | null, error: unknown }>
  addFavorito: (consultorioId: string) => Promise<{ data: Favorito | null, error: unknown }>
  removeFavorito: (consultorioId: string) => Promise<{ error: unknown }>
  isFavorito: (consultorioId: string) => Promise<{ isFavorito: boolean, error: unknown }>
  
  // Funciones de calificaciones
  getCalificaciones: (consultorioId: string) => Promise<{ data: Calificacion[] | null, error: unknown }>
  createCalificacion: (calificacion: CalificacionCreate) => Promise<{ data: Calificacion | null, error: unknown }>
  updateCalificacion: (id: string, updates: Partial<CalificacionCreate>) => Promise<{ data: Calificacion | null, error: unknown }>
  
  // Funciones de estadísticas
  getUserStats: () => Promise<{ data: UserStats | null, error: unknown }>
  getConsultorioStats: (consultorioId: string) => Promise<{ data: ConsultorioStats | null, error: unknown }>
  
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
      profile: null,
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
              nombre: userData.nombre,
              apellidos: userData.apellidos,
              role: userData.role || 'user',
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
          profile: null,
          consultorios: [],
          reservas: [],
          favoritos: [],
          calificaciones: []
        })
      },

      signInWithGoogle: async () => {
        set({ loading: true })
        try {
          // Verificar que window.location.origin esté disponible
          if (typeof window === 'undefined') {
            console.error('Error: window no está disponible (SSR)')
            set({ loading: false })
            return { error: new Error('No se puede ejecutar OAuth en el servidor') }
          }

          // Verificar que el origen esté disponible
          const origin = window.location.origin
          if (!origin) {
            console.error('Error: window.location.origin no está disponible')
            set({ loading: false })
            return { error: new Error('No se puede determinar el origen de la aplicación') }
          }

          console.log('Iniciando Google OAuth con redirectTo:', `${origin}/dashboard`)

          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${origin}/dashboard`,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent'
              }
            }
          })
          
          if (error) {
            console.error('Error en signInWithGoogle:', error)
            set({ loading: false })
            return { error }
          }
          
          // Si no hay error, la redirección debería ocurrir automáticamente
          console.log('Google OAuth iniciado exitosamente')
          return { error: null }
        } catch (error) {
          console.error('Error inesperado en signInWithGoogle:', error)
          set({ loading: false })
          return { error }
        }
      },

      resetPassword: async (email: string) => {
        set({ loading: true })
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          })
          set({ loading: false })
          return { error }
        } catch (error) {
          console.error('Error en resetPassword:', error)
          set({ loading: false })
          return { error }
        }
      },

      confirmEmail: async (token: string) => {
        set({ loading: true })
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
          })
          set({ loading: false })
          return { error }
        } catch (error) {
          console.error('Error en confirmEmail:', error)
          set({ loading: false })
          return { error }
        }
      },

      // Funciones de perfil
      getProfile: async (id?: string) => {
        const { user } = get()
        const profileId = id || user?.id
        
        if (!profileId) {
          return { data: null, error: new Error('No user ID provided') }
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single()
        
        if (data && !id) {
          set({ profile: data })
        }
        
        return { data, error }
      },

      updateProfile: async (updates: ProfileUpdates) => {
        const { user } = get()
        if (!user) return { error: new Error('No user logged in') }
        
        const { error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            full_name: updates.nombre && updates.apellidos ? 
              `${updates.nombre} ${updates.apellidos}` : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
        
        if (!error) {
          // Actualizar perfil en el estado
          const { data: updatedProfile } = await get().getProfile()
          if (updatedProfile) {
            set({ profile: updatedProfile })
          }
        }
        
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
              nombre,
              apellidos,
              avatar_url,
              telefono
            )
          `)
          .eq('activo', true)
          .eq('aprobado', true)

        if (filters?.ciudad) {
          query = query.eq('ciudad', filters.ciudad)
        }
        if (filters?.estado) {
          query = query.eq('estado', filters.estado)
        }
        if (filters?.precio_min) {
          query = query.gte('precio_por_hora', filters.precio_min)
        }
        if (filters?.precio_max) {
          query = query.lte('precio_por_hora', filters.precio_max)
        }
        if (filters?.metros_cuadrados) {
          query = query.gte('metros_cuadrados', filters.metros_cuadrados)
        }
        if (filters?.especialidades && filters.especialidades.length > 0) {
          query = query.overlaps('especialidades', filters.especialidades)
        }
        if (filters?.servicios && filters.servicios.length > 0) {
          query = query.overlaps('servicios', filters.servicios)
        }
        if (filters?.equipamiento && filters.equipamiento.length > 0) {
          query = query.overlaps('equipamiento', filters.equipamiento)
        }

        const { data, error } = await query.order('calificacion_promedio', { ascending: false })
        
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
              nombre,
              apellidos,
              avatar_url,
              telefono,
              biografia
            )
          `)
          .eq('id', id)
          .single()

        // Incrementar vistas
        if (data) {
          await supabase
            .from('consultorios')
            .update({ vistas: data.vistas + 1 })
            .eq('id', id)
        }

        return { data, error }
      },

      getMyConsultorios: async () => {
        const { user } = get()
        if (!user) return { data: null, error: new Error('No user logged in') }

        const { data, error } = await supabase
          .from('consultorios')
          .select('*')
          .eq('propietario_id', user.id)
          .order('created_at', { ascending: false })

        return { data, error }
      },

      createConsultorio: async (consultorio: ConsultorioCreate) => {
        const { user } = get()
        if (!user) return { data: null, error: new Error('No user logged in') }

        try {
          // Preparar los datos del consultorio, excluyendo campos que no existen en la BD
          const consultorioData = {
            titulo: consultorio.titulo,
            descripcion: consultorio.descripcion,
            direccion: consultorio.direccion,
            ciudad: consultorio.ciudad,
            estado: consultorio.estado,
            codigo_postal: consultorio.codigo_postal,
            precio_por_hora: consultorio.precio_por_hora,
            precio_por_dia: consultorio.precio_por_dia,
            precio_por_mes: consultorio.precio_por_mes,
            metros_cuadrados: consultorio.metros_cuadrados,
            numero_consultorios: consultorio.numero_consultorios,
            equipamiento: consultorio.equipamiento || [],
            servicios: consultorio.servicios || [],
            especialidades: consultorio.especialidades || [],
            permite_mascotas: consultorio.permite_mascotas || false,
            estacionamiento: consultorio.estacionamiento || false,
            wifi: consultorio.wifi || false,
            aire_acondicionado: consultorio.aire_acondicionado || false,
            propietario_id: user.id,
            imagenes: [], // Inicialmente sin imágenes
            imagen_principal: null,
          }

          console.log('Datos del consultorio a insertar:', consultorioData)

          // Crear el consultorio
          const { data: newConsultorio, error: insertError } = await supabase
            .from('consultorios')
            .insert(consultorioData)
            .select()
            .single()

          if (insertError || !newConsultorio) {
            console.error('Error creating consultorio:', insertError)
            return { data: null, error: insertError }
          }

          console.log('Consultorio creado exitosamente:', newConsultorio)

          // Si hay imágenes base64, convertirlas y subirlas al storage
          if (consultorio.imagenes && consultorio.imagenes.length > 0) {
            console.log('Procesando imágenes...')
            const uploadedImageUrls: string[] = []
            
            for (let i = 0; i < consultorio.imagenes.length; i++) {
              const base64Image = consultorio.imagenes[i]
              console.log(`Procesando imagen ${i + 1}/${consultorio.imagenes.length}`)
              
              try {
                // Convertir base64 a File
                const response = await fetch(base64Image)
                const blob = await response.blob()
                const file = new File([blob], `image_${i}.jpg`, { type: 'image/jpeg' })
                
                // Subir al storage
                const { url, error: uploadError } = await uploadConsultorioImage(file, newConsultorio.id)
                
                if (uploadError) {
                  console.error('Error uploading image:', uploadError)
                  // Continuar con las otras imágenes
                } else {
                  console.log('Imagen subida exitosamente:', url)
                  uploadedImageUrls.push(url)
                }
              } catch (imageError) {
                console.error(`Error procesando imagen ${i}:`, imageError)
              }
            }

            // Actualizar el consultorio con las URLs de las imágenes
            if (uploadedImageUrls.length > 0) {
              console.log('Actualizando consultorio con imágenes:', uploadedImageUrls)
              const { error: updateError } = await supabase
                .from('consultorios')
                .update({
                  imagenes: uploadedImageUrls,
                  imagen_principal: uploadedImageUrls[0],
                })
                .eq('id', newConsultorio.id)

              if (updateError) {
                console.error('Error updating consultorio with images:', updateError)
              } else {
                console.log('Consultorio actualizado con imágenes exitosamente')
              }
            }
          }

          return { data: newConsultorio, error: null }
        } catch (error) {
          console.error('Error in createConsultorio:', error)
          return { data: null, error: error as Error }
        }
      },

      updateConsultorio: async (id: string, updates: Partial<ConsultorioCreate>) => {
        const { data, error } = await supabase
          .from('consultorios')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
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

      toggleConsultorioStatus: async (id: string, activo: boolean) => {
        const { error } = await supabase
          .from('consultorios')
          .update({ activo })
          .eq('id', id)

        return { error }
      },

      // Funciones de reservas
      getReservas: async (userId?: string) => {
        const { user } = get()
        const targetUserId = userId || user?.id
        
        if (!targetUserId) {
          return { data: null, error: new Error('No user ID provided') }
        }

        const { data, error } = await supabase
          .from('reservas')
          .select(`
            *,
            consultorios (
              id,
              titulo,
              direccion,
              ciudad,
              estado,
              imagen_principal,
              profiles!consultorios_propietario_id_fkey (
                full_name,
                telefono
              )
            )
          `)
          .eq('usuario_id', targetUserId)
          .order('created_at', { ascending: false })
        
        if (data) {
          set({ reservas: data })
        }
        return { data, error }
      },

      getReservasByConsultorio: async (consultorioId: string) => {
        const { data, error } = await supabase
          .from('reservas')
          .select(`
            *,
            profiles!reservas_usuario_id_fkey (
              full_name,
              telefono,
              email
            )
          `)
          .eq('consultorio_id', consultorioId)
          .order('fecha_inicio', { ascending: true })

        return { data, error }
      },

      createReserva: async (reserva: ReservaCreate) => {
        const { user } = get()
        if (!user) return { data: null, error: new Error('No user logged in') }

        const { data, error } = await supabase
          .from('reservas')
          .insert({
            ...reserva,
            usuario_id: user.id,
          })
          .select()
          .single()

        return { data, error }
      },

      updateReserva: async (id: string, updates: Partial<Reserva>) => {
        const { data, error } = await supabase
          .from('reservas')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        return { data, error }
      },

      cancelReserva: async (id: string, motivo?: string) => {
        const { error } = await supabase
          .from('reservas')
          .update({
            estado: 'cancelada',
            motivo_cancelacion: motivo,
            fecha_cancelacion: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        return { error }
      },

      confirmarReserva: async (id: string) => {
        const { error } = await supabase
          .from('reservas')
          .update({
            estado: 'confirmada',
            fecha_confirmacion: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        return { error }
      },

      // Funciones de favoritos
      getFavoritos: async (userId?: string) => {
        const { user } = get()
        const targetUserId = userId || user?.id
        
        if (!targetUserId) {
          return { data: null, error: new Error('No user ID provided') }
        }

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
              precio_por_hora,
              imagen_principal,
              calificacion_promedio,
              total_calificaciones
            )
          `)
          .eq('usuario_id', targetUserId)
        
        if (data) {
          set({ favoritos: data })
        }
        return { data, error }
      },

      addFavorito: async (consultorioId: string) => {
        const { user } = get()
        if (!user) return { data: null, error: new Error('No user logged in') }

        const { data, error } = await supabase
          .from('favoritos')
          .insert({
            usuario_id: user.id,
            consultorio_id: consultorioId
          })
          .select()
          .single()

        return { data, error }
      },

      removeFavorito: async (consultorioId: string) => {
        const { user } = get()
        if (!user) return { error: new Error('No user logged in') }

        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('usuario_id', user.id)
          .eq('consultorio_id', consultorioId)

        return { error }
      },

      isFavorito: async (consultorioId: string) => {
        const { user } = get()
        if (!user) return { isFavorito: false, error: null }

        const { data, error } = await supabase
          .from('favoritos')
          .select('id')
          .eq('usuario_id', user.id)
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
            profiles!calificaciones_usuario_id_fkey (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('consultorio_id', consultorioId)
          .eq('activo', true)
          .order('created_at', { ascending: false })
        
        if (data) {
          set({ calificaciones: data })
        }
        return { data, error }
      },

      createCalificacion: async (calificacion: CalificacionCreate) => {
        const { user } = get()
        if (!user) return { data: null, error: new Error('No user logged in') }

        const { data, error } = await supabase
          .from('calificaciones')
          .insert({
            ...calificacion,
            usuario_id: user.id,
          })
          .select()
          .single()

        return { data, error }
      },

      updateCalificacion: async (id: string, updates: Partial<CalificacionCreate>) => {
        const { data, error } = await supabase
          .from('calificaciones')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        return { data, error }
      },

      // Funciones de estadísticas
      getUserStats: async () => {
        const { user } = get()
        if (!user) return { data: null, error: new Error('No user logged in') }

        try {
          // Obtener estadísticas del usuario
          const [reservasResult, consultoriosResult, favoritosResult, calificacionesResult] = await Promise.all([
            // Reservas del usuario
            supabase
              .from('reservas')
              .select('id, estado, total')
              .eq('usuario_id', user.id),
            
            // Consultorios del usuario (si es propietario)
            supabase
              .from('consultorios')
              .select('id, total_reservas, calificacion_promedio')
              .eq('propietario_id', user.id),
            
            // Favoritos del usuario
            supabase
              .from('favoritos')
              .select('id')
              .eq('usuario_id', user.id),
            
            // Calificaciones recibidas (en consultorios del usuario)
            supabase
              .from('calificaciones')
              .select('puntuacion')
              .eq('consultorio_id', supabase
                .from('consultorios')
                .select('id')
                .eq('propietario_id', user.id)
              )
          ])

          const reservas = reservasResult.data || []
          const consultorios = consultoriosResult.data || []
          const favoritos = favoritosResult.data || []
          const calificaciones = calificacionesResult.data || []

          // Calcular estadísticas
          const stats = {
            // Estadísticas de usuario
            reservasRealizadas: reservas.length,
            consultoriosVisitados: new Set(reservas.map(r => r.id)).size,
            totalGastado: reservas.reduce((sum, r) => sum + (r.total || 0), 0),
            favoritosCount: favoritos.length,
            
            // Estadísticas de propietario (si aplica)
            consultoriosRegistrados: consultorios.length,
            totalReservasRecibidas: consultorios.reduce((sum, c) => sum + (c.total_reservas || 0), 0),
            ingresosTotales: reservas
              .filter(r => consultorios.some(c => c.id === r.id))
              .reduce((sum, r) => sum + (r.total || 0), 0),
            calificacionPromedio: consultorios.length > 0 
              ? consultorios.reduce((sum, c) => sum + (c.calificacion_promedio || 0), 0) / consultorios.length 
              : 0,
            reseñasRecibidas: calificaciones.length
          }

          return { data: stats, error: null }
        } catch (error) {
          console.error('Error getting user stats:', error)
          return { data: null, error }
        }
      },

      getConsultorioStats: async (consultorioId: string) => {
        try {
          const [consultorioResult, reservasResult, calificacionesResult] = await Promise.all([
            // Datos del consultorio
            supabase
              .from('consultorios')
              .select('total_reservas, calificacion_promedio, vistas')
              .eq('id', consultorioId)
              .single(),
            
            // Reservas del consultorio
            supabase
              .from('reservas')
              .select('id, estado, total, created_at')
              .eq('consultorio_id', consultorioId),
            
            // Calificaciones del consultorio
            supabase
              .from('calificaciones')
              .select('puntuacion, created_at')
              .eq('consultorio_id', consultorioId)
              .eq('activo', true)
          ])

          const consultorio = consultorioResult.data
          const reservas = reservasResult.data || []
          const calificaciones = calificacionesResult.data || []

          const stats = {
            totalReservas: consultorio?.total_reservas || 0,
            calificacionPromedio: consultorio?.calificacion_promedio || 0,
            vistas: consultorio?.vistas || 0,
            ingresosTotales: reservas.reduce((sum, r) => sum + (r.total || 0), 0),
            reservasEsteMes: reservas.filter(r => {
              const fecha = new Date(r.created_at)
              const ahora = new Date()
              return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
            }).length,
            totalCalificaciones: calificaciones.length
          }

          return { data: stats, error: null }
        } catch (error) {
          console.error('Error getting consultorio stats:', error)
          return { data: null, error }
        }
      },

      // Funciones de estado
      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) => set({ session }),
      setLoading: (loading: boolean) => set({ loading }),
      clearAuth: () => set({ 
        user: null, 
        session: null,
        profile: null,
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