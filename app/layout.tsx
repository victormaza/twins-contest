import type { Metadata, Viewport } from "next";
import { Noto_Serif_Bengali } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Custom font — place the file at public/fonts/laries.woff2
const laries = localFont({
  src: "../public/fonts/laries.otf",
  variable: "--font-laries",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

// Body font — Google Fonts
const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Twins Contest – Votez pour votre duo préféré !",
  description: "Votez pour votre duo de déguisement préféré lors du Twins Contest.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${laries.variable} ${notoSerifBengali.variable} dark`}>
      <body className="min-h-screen bg-[#002c70] text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
