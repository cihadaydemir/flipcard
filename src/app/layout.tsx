import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import ServiceWorkerRegister from "@/components/service-worker-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flipcard",
  description: "Offline flashcards from your photos",
  applicationName: "Flipcard",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/ios/16.png", sizes: "16x16", type: "image/png" },
      { url: "/ios/32.png", sizes: "32x32", type: "image/png" },
      { url: "/android/android-launchericon-192-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/ios/180.png", sizes: "180x180" },
      { url: "/ios/167.png", sizes: "167x167" },
      { url: "/ios/152.png", sizes: "152x152" },
      { url: "/ios/120.png", sizes: "120x120" },
    ],
    shortcut: [
      { url: "/ios/180.png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flipcard",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-background text-foreground`}
      >
        <Providers>
          {children}
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
