import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Compress PDF Under 200KB - Secure Client-Side Tool',
  description: 'Compress PDF, JPG, and PNG files under 200KB instantly in your browser. No uploads, 100% private and secure.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex flex-col min-h-screen relative selection:bg-primary-500 selection:text-white bg-slate-950 text-slate-50`}>
        {/* Google AdSense Script */}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-[20%] left-[60%] w-[20%] h-[20%] bg-accent-cyan/10 rounded-full blur-[80px] animate-float"></div>
        </div>

        {/* Navigation */}
        <nav className="sticky top-0 z-40 w-full glass-card border-b-0 border-b-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="bg-gradient-to-br from-primary-600 to-accent-purple text-white p-2 rounded-xl shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                            <Zap className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">Turbo<span className="text-primary-400">Compress</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
                    </div>
                </div>
            </div>
        </nav>

        {children}

        <footer className="mt-auto py-8 text-center text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} TurboCompress. Secure & Client-side.</p>
        </footer>
      </body>
    </html>
  );
}