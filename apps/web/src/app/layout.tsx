import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { TopNav } from "@/components/TopNav";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastContainer } from "@/components/ToastContainer";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Habit Tracker Dashboard",
  description: "Track your habits efficiently",
  manifest: "/manifest.json"
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        {/* Force dark mode before hydration to prevent flash of light mode */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (!theme && supportDarkMode) theme = 'dark';
                  
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })()
            `
          }}
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css" integrity="sha512-1sCRPdkRXhBV2PBLUdRb4tMg1w2YPf37qatUFeS7zlBy7jJI8Lf4VHwWfZZfpXtYSLy85pkm9GaYVYMfw5BC1A==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col pt-16 sm:pt-0 pb-20 sm:pb-0 transition-colors duration-300">
        <AuthProvider>
          <GlobalErrorBoundary>
            <TopNav />
            {children}
            <BottomNav />
            <ToastContainer />
          </GlobalErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
