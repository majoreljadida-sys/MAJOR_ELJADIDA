import { MemberSidebar } from '@/components/layout/member-sidebar'

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-major-black flex">
      <MemberSidebar />
      <main className="flex-1 ml-0 lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
