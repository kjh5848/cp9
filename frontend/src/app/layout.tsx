import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/shared/ui/toaster";
import { Navbar } from "@/widgets/navbar/ui/Navbar";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { AuthProvider } from "@/app/providers/AuthProvider";
import "@/shared/styles/globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "CP9 - Deep Tech AI Automation",
  description: "FSD 아키텍처 기반 쿠팡 파트너스 자동화 솔루션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body className={`${syne.variable} ${jakarta.variable} font-sans bg-background text-foreground antialiased`} suppressHydrationWarning>
        <NuqsAdapter>
          <AuthProvider>
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
          </AuthProvider>
          <Toaster 

          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
        {/* 이전에 등록된 mockServiceWorker 자동 해제 */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
              registrations.forEach(function(registration) {
                registration.unregister().then(function(success) {
                  if (success) console.log('[SW] Service Worker 해제됨:', registration.scope);
                });
              });
            });
          }
        `}} />
        </NuqsAdapter>
      </body>
    </html>
  );
}
