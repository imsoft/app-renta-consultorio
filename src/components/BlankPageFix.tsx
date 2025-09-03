'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useAuthStore } from '@/stores/authStore'

interface BlankPageFixProps {
  children: React.ReactNode
}

export default function BlankPageFix({ children }: BlankPageFixProps) {
  const [isDetecting, setIsDetecting] = useState(false)
  const [blankPageDetected, setBlankPageDetected] = useState(false)
  const router = useRouter()
  const { user: supabaseUser, session } = useSupabaseStore()
  const { user: authUser, isAuthenticated } = useAuthStore()

  // Detectar página en blanco de manera más precisa
  const detectBlankPage = () => {
    // Solo verificar en páginas que requieren autenticación
    const currentPath = window.location.pathname
    const protectedPages = ['/dashboard', '/perfil', '/reservas', '/favoritos', '/mis-consultorios', '/admin']
    
    if (!protectedPages.some(page => currentPath.startsWith(page))) {
      return false
    }
    
    // Verificar si hay usuario autenticado pero la página está realmente vacía
    if ((supabaseUser || authUser) && document.body.children.length < 3) {
      console.log('🔧 BlankPageFix: Página en blanco detectada en página protegida')
      return true
    }
    
    // Verificar si hay sesión pero no se muestra contenido principal
    if (session && document.querySelector('main')?.children.length === 0) {
      console.log('🔧 BlankPageFix: Contenido principal vacío detectado')
      return true
    }
    
    return false
  }

  // Reparar página en blanco de manera más suave
  const fixBlankPage = async () => {
    try {
      console.log('🔧 BlankPageFix: Reparando página en blanco...')
      
      // Solo limpiar datos específicos si es necesario
      if (typeof window !== 'undefined') {
        // Limpiar solo datos corruptos de Supabase
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase.auth.token') && key.includes('expires_at')) {
            const expiresAt = localStorage.getItem(key)
            if (expiresAt && new Date(expiresAt) < new Date()) {
              localStorage.removeItem(key)
            }
          }
        })
      }
      
      // Intentar navegar a la misma página en lugar de recargar
      console.log('🔧 BlankPageFix: Navegando a la misma página...')
      router.refresh()
      
    } catch (error) {
      console.error('❌ BlankPageFix: Error reparando página en blanco:', error)
      // Solo recargar como último recurso
      window.location.reload()
    }
  }

  // Detectar y reparar automáticamente con mejor lógica
  useEffect(() => {
    const checkForBlankPage = () => {
      if (isDetecting) return
      
      setIsDetecting(true)
      
      // Esperar más tiempo para evitar falsos positivos
      setTimeout(() => {
        const isBlank = detectBlankPage()
        
        if (isBlank && !blankPageDetected) {
          setBlankPageDetected(true)
          console.log('🔧 BlankPageFix: Iniciando reparación automática...')
          fixBlankPage()
        }
        
        setIsDetecting(false)
      }, 5000) // Aumentar a 5 segundos para evitar falsos positivos
    }

    // Solo verificar si estamos en una página protegida
    const currentPath = window.location.pathname
    const protectedPages = ['/dashboard', '/perfil', '/reservas', '/favoritos', '/mis-consultorios', '/admin']
    
    if (protectedPages.some(page => currentPath.startsWith(page))) {
      const timer = setTimeout(checkForBlankPage, 2000)
      return () => clearTimeout(timer)
    }
  }, [supabaseUser, authUser, session, isAuthenticated, isDetecting, blankPageDetected, router])

  // Mostrar indicador de reparación solo si es necesario
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
