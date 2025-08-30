'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

interface AutoFixOAuthProps {
  children: React.ReactNode
}

export default function AutoFixOAuth({ children }: AutoFixOAuthProps) {
  const [isFixing, setIsFixing] = useState(false)
  const [fixAttempts, setFixAttempts] = useState(0)
  const router = useRouter()
  const { user: supabaseUser, session, setUser, setSession } = useSupabaseStore()
  const { user: authUser, isAuthenticated, setUser: setAuthUser } = useAuthStore()

  // Detectar problemas de sincronización
  const detectOAuthIssue = () => {
    // Problema 1: Usuario en Supabase pero no en AuthStore
    if (supabaseUser && !authUser) {
      console.log('🔧 AutoFix: Detectado usuario en Supabase pero no en AuthStore')
      return 'sync_issue'
    }

    // Problema 2: Usuario en AuthStore pero no en Supabase
    if (!supabaseUser && authUser) {
      console.log('🔧 AutoFix: Detectado usuario en AuthStore pero no en Supabase')
      return 'sync_issue'
    }

    // Problema 3: IDs no coinciden
    if (supabaseUser && authUser && supabaseUser.id !== authUser.id) {
      console.log('🔧 AutoFix: Detectado IDs de usuario no coinciden')
      return 'sync_issue'
    }

    // Problema 4: Sesión activa pero no hay usuario
    if (session && !supabaseUser) {
      console.log('🔧 AutoFix: Detectado sesión activa pero no hay usuario')
      return 'session_issue'
    }

    return null
  }

  // Reparar problema de sincronización
  const fixSyncIssue = async () => {
    try {
      console.log('🔧 AutoFix: Reparando problema de sincronización...')
      
      if (supabaseUser) {
        // Sincronizar AuthStore con SupabaseStore
        const authUserData = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          nombre: supabaseUser.user_metadata?.nombre || 
                  supabaseUser.user_metadata?.full_name?.split(' ')[0] || '',
          apellidos: supabaseUser.user_metadata?.apellidos || 
                    supabaseUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          role: (supabaseUser.user_metadata?.role || 'professional') as 'professional' | 'owner' | 'admin',
          avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
        }
        
        setAuthUser(authUserData)
        console.log('✅ AutoFix: AuthStore sincronizado')
      } else if (authUser) {
        // Intentar recuperar sesión de Supabase
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          console.log('✅ AutoFix: Sesión de Supabase recuperada')
        } else {
          // Limpiar AuthStore si no hay sesión válida
          setAuthUser(null)
          console.log('✅ AutoFix: AuthStore limpiado (no hay sesión válida)')
        }
      }
    } catch (error) {
      console.error('❌ AutoFix: Error reparando sincronización:', error)
    }
  }

  // Reparar problema de sesión
  const fixSessionIssue = async () => {
    try {
      console.log('🔧 AutoFix: Reparando problema de sesión...')
      
      // Forzar refresh de sesión
      const { data: { session: refreshedSession }, error } = await supabase.auth.getSession()
      
      if (refreshedSession) {
        setSession(refreshedSession)
        setUser(refreshedSession.user)
        console.log('✅ AutoFix: Sesión refrescada')
      } else {
        // Limpiar todo si no hay sesión válida
        setSession(null)
        setUser(null)
        setAuthUser(null)
        console.log('✅ AutoFix: Sesión limpiada (no válida)')
      }
    } catch (error) {
      console.error('❌ AutoFix: Error reparando sesión:', error)
    }
  }

  // Limpiar datos corruptos
  const clearCorruptedData = () => {
    try {
      console.log('🔧 AutoFix: Limpiando datos corruptos...')
      
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        // Limpiar datos específicos de la aplicación
        localStorage.removeItem('wellpoint-auth')
        localStorage.removeItem('supabase.auth.token')
        
        // Limpiar datos de Supabase
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('wellpoint')) {
            localStorage.removeItem(key)
          }
        })
        
        console.log('✅ AutoFix: localStorage limpiado')
      }
    } catch (error) {
      console.error('❌ AutoFix: Error limpiando datos:', error)
    }
  }

  // Reparar automáticamente
  const autoFix = async () => {
    if (isFixing || fixAttempts >= 3) return
    
    setIsFixing(true)
    setFixAttempts(prev => prev + 1)
    
    try {
      const issue = detectOAuthIssue()
      
      if (issue === 'sync_issue') {
        await fixSyncIssue()
      } else if (issue === 'session_issue') {
        await fixSessionIssue()
      } else {
        // Si no se detecta problema específico, limpiar datos corruptos
        clearCorruptedData()
      }
      
      // Esperar un momento y verificar si se solucionó
      setTimeout(() => {
        const remainingIssue = detectOAuthIssue()
        if (!remainingIssue) {
          console.log('✅ AutoFix: Problema solucionado automáticamente')
        } else {
          console.log('⚠️ AutoFix: Problema persiste, intentando de nuevo...')
          if (fixAttempts < 3) {
            setTimeout(autoFix, 1000)
          }
        }
        setIsFixing(false)
      }, 500)
      
    } catch (error) {
      console.error('❌ AutoFix: Error durante reparación:', error)
      setIsFixing(false)
    }
  }

  // Detectar y reparar automáticamente
  useEffect(() => {
    const checkAndFix = () => {
      const issue = detectOAuthIssue()
      if (issue) {
        console.log(`🔧 AutoFix: Problema detectado (${issue}), iniciando reparación automática...`)
        autoFix()
      }
    }

    // Verificar después de un breve delay para permitir que los stores se inicialicen
    const timer = setTimeout(checkAndFix, 1000)
    
    return () => clearTimeout(timer)
  }, [supabaseUser, authUser, session, isAuthenticated])

  // Redirigir si es necesario después de la reparación
  useEffect(() => {
    if (!isFixing && supabaseUser && authUser && !window.location.pathname.startsWith('/dashboard')) {
      console.log('🔧 AutoFix: Redirigiendo a dashboard después de reparación...')
      router.push('/dashboard')
    }
  }, [isFixing, supabaseUser, authUser, router])

  // Mostrar indicador de reparación si es necesario
  if (isFixing) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-background border border-border rounded-lg p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="font-medium text-foreground">Reparando autenticación...</h3>
              <p className="text-sm text-muted-foreground">Esto solo tomará un momento</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
