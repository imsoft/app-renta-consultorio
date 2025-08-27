"use client";

import dynamicImport from "next/dynamic";
import { ThemeProvider } from "@/components/theme-provider";

// Forzar renderizado dinamico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

// Importar Header dinamicamente para evitar problemas de prerender
const Header = dynamicImport(() => import("@/components/Header"), {
  ssr: false,
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
