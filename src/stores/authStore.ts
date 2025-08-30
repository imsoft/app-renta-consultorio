import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  role: "professional" | "owner" | "admin";
  avatar?: string | null;
}

interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  tipo: "profesional" | "propietario";
  especialidad?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true });
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simular validación de credenciales
        if (email === "doctor@test.com" && password === "password123") {
          const userData: User = {
            id: "1",
            nombre: "Dr. Laura Martínez",
            email: "doctor@test.com",
            role: "professional",
            apellidos: "Martínez"
          };
          
          set({ 
            user: userData, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        } else if (email === "propietario@test.com" && password === "password123") {
          const userData: User = {
            id: "2",
            nombre: "Carlos Mendoza",
            email: "propietario@test.com",
            role: "owner",
            apellidos: "Mendoza"
          };
          
          set({ 
            user: userData, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        } else {
          set({ isLoading: false });
          return false;
        }
      },

      register: async (userData: RegisterData): Promise<boolean> => {
        set({ isLoading: true });
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simular registro exitoso
        const newUser: User = {
          id: Date.now().toString(),
          nombre: `${userData.nombre} ${userData.apellido}`,
          email: userData.email,
                      role: userData.tipo === "profesional" ? "professional" : "owner",
            apellidos: userData.apellido
        };
        
        set({ 
          user: newUser, 
          isAuthenticated: true, 
          isLoading: false 
        });
        return true;
      },

      setUser: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true 
        });
      },

      clearUser: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
        // Limpiar localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('wellpoint-auth');
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
        // Limpiar localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('wellpoint-auth');
        }
      },
    }),
    {
      name: 'wellpoint-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
