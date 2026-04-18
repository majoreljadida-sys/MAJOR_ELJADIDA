import { Logo } from '@/components/ui/logo'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-major-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
        <Link href="/">
          <Logo size={36} showText textSize="xl" />
        </Link>
        <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm font-inter transition-colors">
          ← Retour au site
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      <p className="text-center text-gray-700 text-xs font-inter py-4">
        © {new Date().getFullYear()} Club MAJOR — El Jadida, Maroc
      </p>
    </div>
  )
}
