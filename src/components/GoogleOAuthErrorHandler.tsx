'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { supabase } from '@/lib/supabase'

interface GoogleOAuthErrorHandlerProps {
  children: React.ReactNode
}

export default function GoogleOAuthErrorHandler({ children }: GoogleOAuthErrorHandlerProps) {
  const [isHandlingError, setIsHandlingError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const { signInWithGoogle } = useSupabaseStore()

  // Detectar errores de OAuth en la URL
  const detectOAuthError = () => {
    if (typeof window === 'undefined') return null
    
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')
    
    if (error) {
      console.log('🔧 OAuthErrorHandler: Error detectado en URL:', error, errorDescription)
      return { error, errorDescription }
    }
    
    return null
  }

  // Manejar errores específicos de OAuth
  const handleOAuthError = async (error: string, description?: string | null) => {
    setIsHandlingError(true)
    
    try {
      console.log('🔧 OAuthErrorHandler: Manejando error:', error)
      
      switch (error) {
        case 'access_denied':
          setErrorMessage('Acceso denegado. Por favor, intenta de nuevo.')
          break
          
        case 'invalid_request':
          setErrorMessage('Solicitud inválida. Limpiando datos y reintentando...')
          await clearOAuthData()
          break
          
        case 'server_error':
          setErrorMessage('Error del servidor. Intentando de nuevo...')
          await retryOAuth()
          break
          
        case 'temporarily_unavailable':
          setErrorMessage('Servicio temporalmente no disponible. Reintentando...')
          await retryOAuth()
          break
          
        default:
          setErrorMessage('Error inesperado. Limpiando datos y reintentando...')
          await clearOAuthData()
          break
      }
      
      // Limpiar parámetros de error de la URL
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
      
    } catch (error) {
      console.error('❌ OAuthErrorHandler: Error manejando OAuth error:', error)
      setErrorMessage('Error inesperado. Por favor, recarga la página.')
    } finally {
      setIsHandlingError(false)
    }
  }

  // Limpiar datos de OAuth
  const clearOAuthData = async () => {
    try {
      console.log('🔧 OAuthErrorHandler: Limpiando datos de OAuth...')
      
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wellpoint-auth')
        localStorage.removeItem('supabase.auth.token')
        
        // Limpiar datos de Supabase
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('wellpoint')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      // Limpiar sesión de Supabase
      await supabase.auth.signOut()
      
      console.log('✅ OAuthErrorHandler: Datos limpiados')
      
    } catch (error) {
      console.error('❌ OAuthErrorHandler: Error limpiando datos:', error)
    }
  }

  // Reintentar OAuth
  const retryOAuth = async () => {
    try {
      console.log('🔧 OAuthErrorHandler: Reintentando OAuth...')
      
      // Esperar un momento antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { error } = await signInWithGoogle()
      
      if (error) {
        console.error('❌ OAuthErrorHandler: Error en reintento:', error)
        setErrorMessage('Error al reintentar. Por favor, recarga la página.')
      }
      
    } catch (error) {
      console.error('❌ OAuthErrorHandler: Error en reintento:', error)
      setErrorMessage('Error inesperado. Por favor, recarga la página.')
    }
  }

  // Detectar y manejar errores automáticamente
  useEffect(() => {
    const oauthError = detectOAuthError()
    
    if (oauthError) {
      handleOAuthError(oauthError.error, oauthError.errorDescription)
    }
  }, [])

  // Mostrar mensaje de error si es necesario
  if (errorMessage) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-background border border-border rounded-lg p-6 shadow-lg max-w-md mx-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="font-medium text-foreground mb-2">Error de autenticación</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {errorMessage}
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  setErrorMessage(null)
                  window.location.reload()
                }}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
              >
                Recargar página
              </button>
              <button 
                onClick={() => {
                  setErrorMessage(null)
                  router.push('/login')
                }}
                className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/80"
              >
                Volver al login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar indicador de manejo de error
  if (isHandlingError) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-background border border-border rounded-lg p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="font-medium text-foreground">Solucionando problema...</h3>
              <p className="text-sm text-muted-foreground">Esto solo tomará un momento</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
