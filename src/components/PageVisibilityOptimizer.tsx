'use client'

import { useEffect, useRef } from 'react'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useAuthStore } from '@/stores/authStore'

interface PageVisibilityOptimizerProps {
  children: React.ReactNode
}

export default function PageVisibilityOptimizer({ children }: PageVisibilityOptimizerProps) {
  const { setLoading } = useSupabaseStore()
  const { isLoading: authLoading } = useAuthStore()
  const isPageVisible = useRef(true)
  const lastVisibilityChange = useRef(Date.now())

  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now()
      const timeSinceLastChange = now - lastVisibilityChange.current
      
      // Solo procesar si han pasado al menos 100ms desde el último cambio
      if (timeSinceLastChange < 100) return
      
      lastVisibilityChange.current = now
      
      if (document.hidden) {
        // Página oculta - pausar operaciones innecesarias
        console.log('📱 Página oculta - pausando operaciones')
        isPageVisible.current = false
        
        // Pausar timers y operaciones pesadas
        if (authLoading) {
          setLoading(false)
        }
      } else {
        // Página visible - reanudar operaciones
        console.log('📱 Página visible - reanudando operaciones')
        isPageVisible.current = true
        
        // Solo reanudar si es necesario
        if (!authLoading) {
          // No hacer nada - mantener el estado actual
        }
      }
    }

    // Escuchar cambios de visibilidad
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Escuchar cambios de foco de ventana
    window.addEventListener('focus', () => {
      if (document.visibilityState === 'visible') {
        handleVisibilityChange()
      }
    })
    
    window.addEventListener('blur', () => {
      if (document.visibilityState === 'hidden') {
        handleVisibilityChange()
      }
    })

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
      window.removeEventListener('blur', handleVisibilityChange)
    }
  }, [setLoading, authLoading])

  // Optimizar re-renders usando React.memo internamente
  return <>{children}</>
}
