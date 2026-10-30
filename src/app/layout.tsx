import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FactureB2B - Facturation Freelance International",
  description: "Outil de facturation pour freelances avec clients à l'étranger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex h-screen bg-white">
          <Suspense fallback={<div className="w-64 border-r border-zinc-200" />}>
            <Sidebar />
          </Suspense>
          <main className="flex-1 overflow-y-auto">
            <Suspense fallback={<div className="p-8">Chargement...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </body>
    </html>
  );
}
