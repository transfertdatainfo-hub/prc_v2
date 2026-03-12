import type { Metadata } from "next";
//import { Inter, Geist } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { geist } from "../styles/geist-font";

//const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Privatis Capital (PRC)",
  description: "Plateforme PRC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*<html lang="fr" className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>{children}</body>
    </html>*/
    <html lang="fr">
      <body className={`${inter.variable} ${geist.variable}`}>{children}</body>
    </html>
  );
}
