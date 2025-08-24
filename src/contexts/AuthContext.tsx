'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  const { setUser: setStoreUser, clearUser } = useAuthStore()

  useEffect(() => {
    // Obtener sesión inicial
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Sincronizar con el store
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setStoreUser({
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
          
          setStoreUser({
            id: session.user.id,
            email: session.user.email!,
            nombre: profile?.full_name?.split(' ')[0] || '',
            apellidos: profile?.full_name?.split(' ').slice(1).join(' ') || '',
            role: profile?.role || 'professional',
            avatar: profile?.avatar_url || null,
          })
        } else if (event === 'SIGNED_OUT') {
          clearUser()
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [setStoreUser, clearUser])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData: any) => {
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
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: any) => {
    if (!user) return { error: 'No user logged in' }
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: `${updates.nombre} ${updates.apellidos}`,
        avatar_url: updates.avatar,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
    
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
