import type { Metadata, Viewport } from "next";
import { Inter, Caveat } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { ScrollEffects } from "@/components/ScrollEffects";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/components.css";
import "@/styles/landing.css";
import "@/styles/student.css";
import "@/styles/admin.css";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const handwriting = Caveat({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-handwriting",
  display: "swap",
});

export const metadata: Metadata = {
  title: "THE LAST CHAPTER — 2026-yil bitiruvchilari",
  description: "Ikkita 11-sinf uchun bitiruv oqshomi. Yana bir unutilmas kecha birga.",
  // Private event: keep it out of search results.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f6f5ef",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${inter.variable} ${handwriting.variable}`}>
      <body>
        <ToastProvider><ScrollEffects /><div className="site-paper">{children}</div></ToastProvider>
      </body>
    </html>
  );
}
