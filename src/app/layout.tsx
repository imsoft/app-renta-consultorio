import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SupabaseProvider } from "@/components/SupabaseProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/next"

// Deshabilitar prerender globalmente para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WellPoint - Alquiler de Consultorios Médicos",
  description: "Conectamos profesionales de la salud con espacios médicos de calidad. La plataforma más confiable para rentar y encontrar consultorios médicos.",
  icons: {
    icon: [
      {
        url: "/logo.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="light"
        >
          <ErrorBoundary>
            <SupabaseProvider>
              {children}
            </SupabaseProvider>
          </ErrorBoundary>
        </ThemeProvider>
        {/* Analytics opcional - se carga solo si no está bloqueado */}
        {process.env.NODE_ENV === 'production' && (
          <Analytics />
        )}
      </body>
    </html>
  );
}
