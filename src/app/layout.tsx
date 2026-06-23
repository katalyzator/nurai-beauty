import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nurai.beauty"),
  title: "NurAI",
  description: "Запись в салоны красоты Бишкека без ожидания ответа.",
  icons: {
    icon: "/brand/nurai-logo.png",
    apple: "/brand/nurai-logo.png",
  },
  openGraph: {
    title: "NurAI",
    description: "Запись в салоны красоты Бишкека без ожидания ответа.",
    images: ["/brand/nurai-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <body>
        {children}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
