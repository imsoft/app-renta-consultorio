"use client";

import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";

// Importar Header dinámicamente para evitar problemas de prerender
const Header = dynamic(() => import("@/components/Header"), {
  ssr: false,
});

export default function ConsultoriosLayout({
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
        <Footer />
      </div>
    </ThemeProvider>
  );
}
