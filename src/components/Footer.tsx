import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="sm:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo.svg"
                  alt="WellPoint Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-primary">WellPoint</h3>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md text-sm sm:text-base">
              Conectando profesionales de la salud con espacios médicos de calidad. 
              La plataforma más confiable para rentar y encontrar consultorios médicos.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Servicios</h4>
            <ul className="space-y-2 sm:space-y-3 text-muted-foreground">
              <li><Link href="/consultorios" className="hover:text-primary transition-colors text-sm sm:text-base">Buscar consultorios</Link></li>
              <li><Link href="/publicar-espacio" className="hover:text-primary transition-colors text-sm sm:text-base">Publicar espacio</Link></li>
              <li><Link href="/reservas" className="hover:text-primary transition-colors text-sm sm:text-base">Reservas</Link></li>
              <li><Link href="/pagos-seguros" className="hover:text-primary transition-colors text-sm sm:text-base">Pagos seguros</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Soporte</h4>
            <ul className="space-y-2 sm:space-y-3 text-muted-foreground">
              <li><Link href="/centro-ayuda" className="hover:text-primary transition-colors text-sm sm:text-base">Centro de ayuda</Link></li>
              <li><Link href="/contacto" className="hover:text-primary transition-colors text-sm sm:text-base">Contacto</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors text-sm sm:text-base">FAQ</Link></li>
              <li><Link href="/reportar-problema" className="hover:text-primary transition-colors text-sm sm:text-base">Reportar problema</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-muted-foreground text-xs sm:text-sm">
              &copy; 2025 WellPoint. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6">
              <Link href="/terminos-servicio" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm">
                Términos de servicio
              </Link>
              <Link href="/politica-privacidad" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm">
                Política de privacidad
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
