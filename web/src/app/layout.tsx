import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
export const metadata: Metadata = { title: "Agronex", description: "Plataforma para coordinar camiones y maquinaria agrícola." };
const themeBoot = "try{var t=localStorage.getItem('agronex_theme')||'normal';document.documentElement.dataset.theme=t}catch(e){}";
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es" suppressHydrationWarning><body className={`${inter.variable} ${fraunces.variable}`}><script dangerouslySetInnerHTML={{ __html: themeBoot }} /><header className="topbar"><div className="shell"><a className="brand" href="/catalogo">Agronex</a><nav className="nav" aria-label="Principal"><a href="/catalogo">Catálogo</a><a href="/ingresar">Ingresar</a><ThemeToggle /></nav></div></header>{children}</body></html>; }
