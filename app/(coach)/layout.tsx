import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-major-black flex">
      <AdminSidebar variant="coach" />
      <main className="flex-1 ml-0 lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
