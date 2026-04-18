import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-major-black flex">
      <AdminSidebar variant="admin" />
      <main className="flex-1 ml-0 lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
