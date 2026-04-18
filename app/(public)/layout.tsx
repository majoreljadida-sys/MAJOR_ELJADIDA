import { PublicHeader }   from '@/components/layout/public-header'
import { PublicFooter }   from '@/components/layout/public-footer'
import { ChatbotWidget }  from '@/components/chatbot/chatbot-widget'
import { LanguageProvider } from '@/lib/i18n/context'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
    <div className="public-watermark min-h-screen flex flex-col relative overflow-x-hidden">

      {/* Logo filigrane — par-dessus tout, sans gêner la lecture */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 40 }}
      >
        <img
          src="/logo_major.png"
          alt=""
          aria-hidden="true"
          className="w-[320px] h-[320px] sm:w-[520px] sm:h-[520px] lg:w-[640px] lg:h-[640px] object-contain select-none"
          style={{
            opacity: 0.06,
            mixBlendMode: 'overlay',
            filter: 'drop-shadow(0 0 60px rgba(45,140,110,1)) drop-shadow(0 0 120px rgba(58,191,191,0.7))',
          }}
        />
      </div>

      <PublicHeader />
      <main className="flex-1 pt-16 lg:pt-32 relative z-10">{children}</main>
      <PublicFooter />
      <ChatbotWidget />
    </div>
    </LanguageProvider>
  )
}
