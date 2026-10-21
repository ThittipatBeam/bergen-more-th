import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans_Thai, Space_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LanguageProvider } from "@/hooks/use-language";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thai RAG Benchmark",
  description:
    "Standardized evaluation benchmark and leaderboard for Thai retrieval-augmented generation and embedding models.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${notoSansThai.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var _t=localStorage.getItem("theme");if(_t==="dark"||(!_t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(_e){}',
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background-canvas)] text-[var(--text-primary)] transition-colors duration-200 selection:bg-[var(--brand-sky-blue)] selection:text-white">
        <LanguageProvider>
          <Navbar />
          {children}
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
