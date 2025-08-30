'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

interface BlankPageFixProps {
  children: React.ReactNode
}

export default function BlankPageFix({ children }: BlankPageFixProps) {
  const [isDetecting, setIsDetecting] = useState(false)
  const [blankPageDetected, setBlankPageDetected] = useState(false)
  const router = useRouter()
  const { user: supabaseUser, session } = useSupabaseStore()
  const { user: authUser, isAuthenticated } = useAuthStore()

  // Detectar página en blanco
  const detectBlankPage = () => {
    // Verificar si estamos en una página que debería mostrar contenido
    const currentPath = window.location.pathname
    
    // Páginas que deberían mostrar contenido después del login
    const contentPages = ['/dashboard', '/perfil', '/reservas', '/favoritos', '/mis-consultorios']
    
    if (contentPages.some(page => currentPath.startsWith(page))) {
      // Verificar si hay usuario autenticado pero la página está vacía
      if ((supabaseUser || authUser) && document.body.children.length < 3) {
        console.log('🔧 BlankPageFix: Página en blanco detectada')
        return true
      }
      
      // Verificar si hay sesión pero no se muestra contenido
      if (session && document.querySelector('main')?.children.length === 0) {
        console.log('🔧 BlankPageFix: Contenido principal vacío detectado')
        return true
      }
    }
    
    return false
  }

  // Reparar página en blanco
  const fixBlankPage = async () => {
    try {
      console.log('🔧 BlankPageFix: Reparando página en blanco...')
      
      // Limpiar datos corruptos
      if (typeof window !== 'undefined') {
        // Limpiar localStorage específico
        localStorage.removeItem('wellpoint-auth')
        localStorage.removeItem('supabase.auth.token')
        
        // Limpiar datos de Supabase
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('wellpoint')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      // Forzar refresh de la página
      console.log('🔧 BlankPageFix: Recargando página...')
      window.location.reload()
      
    } catch (error) {
      console.error('❌ BlankPageFix: Error reparando página en blanco:', error)
    }
  }

  // Detectar y reparar automáticamente
  useEffect(() => {
    const checkForBlankPage = () => {
      if (isDetecting) return
      
      setIsDetecting(true)
      
      // Esperar un poco para que la página se cargue completamente
      setTimeout(() => {
        const isBlank = detectBlankPage()
        
        if (isBlank && !blankPageDetected) {
          setBlankPageDetected(true)
          console.log('🔧 BlankPageFix: Iniciando reparación automática...')
          fixBlankPage()
        }
        
        setIsDetecting(false)
      }, 2000) // Esperar 2 segundos para detectar página en blanco
    }

    // Verificar después de que los stores se inicialicen
    const timer = setTimeout(checkForBlankPage, 1000)
    
    return () => clearTimeout(timer)
  }, [supabaseUser, authUser, session, isAuthenticated, isDetecting, blankPageDetected])

  // Mostrar indicador de reparación si es necesario
  if (blankPageDetected) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-background border border-border rounded-lg p-6 shadow-lg max-w-md mx-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="font-medium text-foreground mb-2">Reparando página...</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Detectamos un problema con la carga de la página. Lo estamos solucionando automáticamente.
            </p>
            <div className="text-xs text-muted-foreground">
              Si la página no se recarga automáticamente, 
              <button 
                onClick={() => window.location.reload()} 
                className="text-primary hover:underline ml-1"
              >
                haz clic aquí
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
