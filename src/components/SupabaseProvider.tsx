'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    // Obtener sesión inicial
    const getSession = async () => {
      try {
        setLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Sincronizar con el store de auth
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
            role: (session.user.user_metadata?.role || profile?.role || 'professional') as 'professional' | 'owner' | 'admin',
            avatar: session.user.user_metadata?.avatar_url || profile?.avatar_url || null,
          })
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error in getSession:', error)
        setLoading(false)
      }
    }

    getSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state changed:', event, session?.user?.email)
          setSession(session)
          setUser(session?.user ?? null)
          
          if (event === 'SIGNED_IN' && session?.user) {
            // Crear o actualizar perfil
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
                role: session.user.user_metadata?.role || 'professional',
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
              role: (session.user.user_metadata?.role || profile?.role || 'professional') as 'professional' | 'owner' | 'admin',
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
