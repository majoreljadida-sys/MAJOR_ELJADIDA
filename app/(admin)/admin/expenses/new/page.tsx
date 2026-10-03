import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ExpenseForm } from '../expense-form'

export const dynamic = 'force-dynamic'

export default async function NewExpensePage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const events = await prisma.event.findMany({
    select: { id: true, title: true },
    orderBy: { date: 'desc' },
    take: 50,
  })

  return <ExpenseForm mode="create" events={events} />
}
