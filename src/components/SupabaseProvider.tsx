'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useAuthStore } from '@/stores/authStore'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { 
    setUser, 
    setSession, 
    setLoading, 
    clearAuth 
  } = useSupabaseStore()
  
  const { setUser: setAuthUser, clearUser } = useAuthStore()

  // Usar refs para evitar re-renders innecesarios
  const isInitialized = useRef(false)
  const lastUserId = useRef<string | null>(null)

  useEffect(() => {
    // Obtener sesión inicial solo una vez
    const getSession = async () => {
      if (isInitialized.current) return
      
      try {
        setLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }
        
        // Solo actualizar si el usuario cambió
        if (session?.user?.id !== lastUserId.current) {
          lastUserId.current = session?.user?.id || null
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // Sincronizar con el store de auth solo si es necesario
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching profile:', profileError)
            }
            
            // Extraer nombre y apellidos de user_metadata o usar valores por defecto
            const fullName = session.user.user_metadata?.full_name || profile?.full_name || ''
            const nameParts = fullName.split(' ')
            
            setAuthUser({
              id: session.user.id,
              email: session.user.email!,
              nombre: session.user.user_metadata?.nombre || nameParts[0] || '',
              apellidos: session.user.user_metadata?.apellidos || nameParts.slice(1).join(' ') || '',
              role: (session.user.user_metadata?.role === 'admin' ? 'admin' : 'user') as 'user' | 'admin',
              avatar: session.user.user_metadata?.avatar_url || profile?.avatar_url || null,
            })
          }
        }
        
        setLoading(false)
        isInitialized.current = true
      } catch (error) {
        console.error('Error in getSession:', error)
        setLoading(false)
        isInitialized.current = true
      }
    }

    getSession()

    // Escuchar cambios en la autenticación de manera más eficiente
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          // Solo procesar si realmente cambió el usuario
          if (session?.user?.id === lastUserId.current && event !== 'SIGNED_OUT') {
            return
          }
          
          console.log('Auth state changed:', event, session?.user?.email)
          lastUserId.current = session?.user?.id || null
          setSession(session)
          setUser(session?.user ?? null)
          
          if (event === 'SIGNED_IN' && session?.user) {
            // Crear o actualizar perfil solo si es necesario
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileError && profileError.code === 'PGRST116') {
              // Perfil no existe, crear uno nuevo
              const newProfile = {
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || 
                          `${session.user.user_metadata?.nombre || ''} ${session.user.user_metadata?.apellidos || ''}`.trim(),
                role: session.user.user_metadata?.role === 'admin' ? 'admin' : 'user',
                avatar_url: session.user.user_metadata?.avatar_url || null,
              }
              
              const { error: insertError } = await supabase
                .from('profiles')
                .insert(newProfile)
              
              if (insertError) {
                console.error('Error creating profile:', insertError)
              }
            }
            
            // Extraer nombre y apellidos
            const fullName = session.user.user_metadata?.full_name || profile?.full_name || ''
            const nameParts = fullName.split(' ')
            
            setAuthUser({
              id: session.user.id,
              email: session.user.email!,
              nombre: session.user.user_metadata?.nombre || nameParts[0] || '',
              apellidos: session.user.user_metadata?.apellidos || nameParts.slice(1).join(' ') || '',
              role: (session.user.user_metadata?.role === 'admin' ? 'admin' : 'user') as 'user' | 'admin',
              avatar: session.user.user_metadata?.avatar_url || profile?.avatar_url || null,
            })
          } else if (event === 'SIGNED_OUT') {
            clearAuth()
            clearUser()
          }
          
          setLoading(false)
        } catch (error) {
          console.error('Error in auth state change:', error)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setLoading, clearAuth, setAuthUser, clearUser])

  return <>{children}</>
}
