import type { Metadata, Viewport } from 'next';
import './globals.css';
import RegisterSW from '@/components/RegisterSW';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'NutriHub — Plataforma de Nutrição',
  description: 'Plataforma SaaS de acompanhamento nutricional personalizado para nutricionistas e pacientes',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#556f4a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`
          }}
        />
      </head>
      <body>
        <RegisterSW />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-sage-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl">
          Pular para conteúdo principal
        </a>
        <Header />
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
