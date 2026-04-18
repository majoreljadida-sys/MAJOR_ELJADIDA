import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Club MAJOR — Mazagan Athlétisme Jogging And Organisation',
    template: '%s | Club MAJOR',
  },
  description:
    'Le Club MAJOR est un club de course à pied basé à El Jadida (Mazagan). Jogging loisir, athlétisme, compétitions et événements sportifs en famille.',
  keywords: ['running', 'jogging', 'athlétisme', 'El Jadida', 'Mazagan', 'club sportif', 'course à pied', 'MAJOR'],
  authors: [{ name: 'Club MAJOR' }],
  creator: 'Club MAJOR',
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    siteName: 'Club MAJOR',
    title: 'Club MAJOR — Mazagan Athlétisme Jogging And Organisation',
    description: 'Courez avec nous ! Le Club MAJOR vous accueille pour des entraînements, événements et bien plus.',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-major-black text-white font-inter antialiased">
        <SessionProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1A1A2E',
                color: '#fff',
                border: '1px solid #2D8C6E40',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#4CAF82', secondary: '#0D0D0D' } },
              error:   { iconTheme: { primary: '#EF4444', secondary: '#0D0D0D' } },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}
