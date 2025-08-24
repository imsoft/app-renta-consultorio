"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Header({ currentPage = "/" }: { currentPage?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-xl text-primary">ConsultorioApp</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                
                {user?.role === "professional" && (
                  <>
                    <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                      <Link href="/reservas">Reservas</Link>
                    </Button>
                    <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                      <Link href="/favoritos">Favoritos</Link>
                    </Button>
                  </>
                )}
                {user?.role === "owner" && (
                  <>
                    <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                      <Link href="/reservas">Reservas</Link>
                    </Button>
                    <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                      <Link href="/ingresos">Ingresos</Link>
                    </Button>
                    <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                      <Link href="/mis-consultorios">Mis Consultorios</Link>
                    </Button>
                  </>
                )}
                <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                  <Link href="/consultorios">Explorar Consultorios</Link>
                </Button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{user?.nombre}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/perfil" className="w-full">
                        <User className="h-4 w-4 mr-2" />
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button asChild variant="ghost">
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/registro">Registrarse</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                
                {user?.role === "professional" && (
                  <>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/reservas">Reservas</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/favoritos">Favoritos</Link>
                    </Button>
                  </>
                )}
                
                {user?.role === "owner" && (
                  <>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/reservas">Reservas</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/ingresos">Ingresos</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/mis-consultorios">Mis Consultorios</Link>
                    </Button>
                  </>
                )}
                
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/consultorios">Explorar Consultorios</Link>
                </Button>
                
                {/* Theme Toggle for Mobile */}
                <div className="flex justify-start px-3 py-2">
                  <ThemeToggle />
                </div>
                
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/perfil">Perfil</Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link href="/registro">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
