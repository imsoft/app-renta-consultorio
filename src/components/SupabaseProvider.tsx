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
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Sincronizar con el store de auth
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setAuthUser({
          id: session.user.id,
          email: session.user.email!,
          nombre: profile?.full_name?.split(' ')[0] || '',
          apellidos: profile?.full_name?.split(' ').slice(1).join(' ') || '',
          role: profile?.role || 'professional',
          avatar: profile?.avatar_url || null,
        })
      }
      
      setLoading(false)
    }

    getSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Crear o actualizar perfil
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (!profile) {
            // Crear perfil si no existe
            await supabase.from('profiles').insert({
              id: session.user.id,
              email: session.user.email,
              role: 'professional',
            })
          }
          
          setAuthUser({
            id: session.user.id,
            email: session.user.email!,
            nombre: profile?.full_name?.split(' ')[0] || '',
            apellidos: profile?.full_name?.split(' ').slice(1).join(' ') || '',
            role: profile?.role || 'professional',
            avatar: profile?.avatar_url || null,
          })
        } else if (event === 'SIGNED_OUT') {
          clearAuth()
          clearUser()
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setLoading, clearAuth, setAuthUser, clearUser])

  return <>{children}</>
}
